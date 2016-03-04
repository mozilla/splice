#!/usr/bin/env python

from optparse import OptionParser
import json
import traceback
from splice.models import (BucketerDomain, BucketerRelated, BucketerComscore, BucketerModel)
from splice.bucketer.domain_map import DomainMap
from sqlalchemy import delete
import sys
import math


def addOrMerge(session, entry, options):
    # no need to merge is tables are cleared
    if options.clear_tables:
        session.add(entry)
    else:
        session.merge(entry)


def processJsonEntry(e, session, domainMap, options):
    try:
        domain = e["domain"].replace("#", ".")
        rank = e["alexa"]["rank"]["latest"]
    except Exception as e:
        print 'Unparasable domain or rank missing: ERROR: %s' % e
        return

    if rank > options.rank_limit:
        return

    html = "html" in e and e["html"] or {}
    domain_id = domainMap.getDomainID(domain, True)
    if options.verbose:
        sys.stdout.write("Site '%s', ID %d, rank %d                            \r" % (domain, domain_id, rank))
        sys.stdout.flush()

    # insert the main entry data
    entry = BucketerDomain(id=domain_id,
                           domain=domain,
                           rank=rank,
                           description="meta_description" in html and html["meta_description"][0:1023] or None,
                           title="page_title" in html and html["page_title"][0:215] or None)
    addOrMerge(session, entry, options)

    # process related sites
    if "similar" in e and "similarsites" in e["similar"]:
        for pair in e["similar"]["similarsites"]:
            domainMap.addRelatedSite(domain, "similar", pair["url"], pair["score"])

    if "RLS" in e["alexa"] and "RL" in e["alexa"]["RLS"]:
        score = 1
        if type(e["alexa"]["RLS"]["RL"]) is dict:
            domainMap.addRelatedSite(domain,
                                     "alexa",
                                     e["alexa"]["RLS"]["RL"]['@HREF'].rstrip("/"),
                                     score)
        elif type(e["alexa"]["RLS"]["RL"]) is list:
            for pair in e["alexa"]["RLS"]["RL"]:
                domainMap.addRelatedSite(domain, "alexa", pair['@HREF'].rstrip("/"), score)
                score -= 0.001
        else:
            print "Unrecognized type %s" % type(e["alexa"]["RLS"]["RL"])

    # process comscore data
    if "comscore" in e:
        session.flush()
        comscore = e["comscore"]["traffic"]["2014-Q4"]
        entry = BucketerComscore(domain_id=domain_id,
                                 rank=rank,
                                 reach=comscore["reach"],
                                 users=comscore["unique_visitors"],
                                 visits=comscore["visits"],
                                 pages=comscore["pages"])
        addOrMerge(session, entry, options)
        domainMap.addModelSite(domain_id, rank, comscore["unique_visitors"])


def clearBucketerTables(session, options):
    # always clear the model
    session.execute(delete(BucketerModel))
    # check if other tables need a clear
    if options.clear_tables:
        print "Deleting Buckter tables - do not interrupt, may hang"
        print "Deleting BucketerComscore"
        session.execute(delete(BucketerComscore))
        print "Deleting BucketerRelated"
        session.execute(delete(BucketerRelated))
        session.flush()
        # @TODO - this commit is a horrid hack, but without it deletion
        # takes forever, because apparently sqlalchemy wants to check
        # foreign key constrians on all tables that depend on bucketer_domain.id
        # the only way I could find to make it not hang is to commit
        # emptied dependend tables before attempting to delete
        # will look for better alternative as time permits
        session.commit()
        print "Deleting BucketerDomain - this may take loooong time for many domains"
        session.connection().execute("delete from bucketer_domain")
        print "Flushing after deletion"
        session.flush()


# this code is lifted from http://jmduke.com/posts/basic-linear-regressions-in-python/
def basic_linear_regression(x, y):
    # Basic computations to save a little time.
    length = len(x)
    sum_x = sum(x)
    sum_y = sum(y)

    # Sum{x^2}, and Sum{xy} respectively.
    sum_x_squared = sum(map(lambda a: a * a, x))
    sum_of_products = sum([x[i] * y[i] for i in range(length)])

    # Magic formulae!
    slope = (sum_of_products - (sum_x * sum_y) / length) / (sum_x_squared - ((sum_x ** 2) / length))
    intercept = (sum_y - slope * sum_x) / length
    variance = sum([(y[i] - intercept - slope * x[i]) ** 2 for i in range(length)]) / length
    return slope, intercept, math.sqrt(variance)


def fitAndSaveModel(session, domainMap, options):
    print "Fitting and saving rank model"
    log_x = map(lambda a: math.log(a), domainMap.getModelRanks())
    log_y = map(lambda a: math.log(a), domainMap.getModelUsers())
    slope, intercept, std_er = basic_linear_regression(log_x, log_y)
    session.add(BucketerModel(
                description="Log regresssion on alexa_rank:users pairs",
                slope=slope,
                intercept=intercept,
                std_er=std_er))


def readJsonDump(file, env, options):
    domainMap = DomainMap()
    with env.application.app_context():
        session = env.db.session
        clearBucketerTables(session, options)
        print "Processing mongo json dump for top %d sites" % (options.rank_limit)
        with open(file, "r") as dump:
            for line in dump:
                try:
                    jsonEntry = json.loads(line)
                    # handle one json object
                    processJsonEntry(jsonEntry, session, domainMap, options)
                except Exception as e:
                    msg = 'ERROR: %s' % e
                    print(msg)
                    print(traceback.format_exc())
                    continue

    # flush session to ensure domain ids are available
    sys.stdout.write("json file has been read - flushing session, may take time       \n")
    sys.stdout.flush()
    session.flush()
    domainMap.populateRelatedTable(session, options)
    fitAndSaveModel(session, domainMap, options)
    print "Committing transaction - may take time..."
    session.commit()


def main():
    # get argument
    parser = OptionParser(
        usage='Usage: %prog [<JSON FILE>]'
        '\n\nArguments:'
        '\n  JSON FILE    domains.json file'
        '\n\nExamples:'
        '\n  %prog domains.json'
        '\n  Download domains.json from s3://moz-tiles-maksik/bucketer/domains.json'
    )
    parser.set_defaults(
        quiet=False,
        verbose=False,
        rank_limit=10000000,
        clear_tables=False,
    )
    parser.add_option(
        '-q', '--quiet',
        action='store_true',
        dest='quiet',
        help="Don't report NOTICE",
    )
    parser.add_option(
        '-v', '--verbose',
        action='store_true',
        dest='verbose',
        help='Report SUCCESS',
    )
    parser.add_option(
        '-c', '--clean',
        action='store_true',
        dest='clear_tables',
        help='clear tables before processing the file',
    )
    parser.add_option(
        '-r', '--rank',
        dest='rank_limit',
        help="highest rank limit",
    )
    options, args = parser.parse_args()
    options.rank_limit = int(options.rank_limit)

    from splice.environment import Environment

    if len(args) == 1:
        try:
            readJsonDump(args.pop(), Environment.instance(), options)
        except Exception as e:
            msg = 'ERROR: %s' % e
            print(msg)
            print(traceback.format_exc())
    else:
        parser.parse_args(['-h'])

if __name__ == '__main__':
    main()
