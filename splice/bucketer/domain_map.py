#!/usr/bin/env python
from sets import Set
from splice.models import (BucketerRelated)

class DomainMap:
  def __init__(self):
    self.idCount = 0
    self.domains = {}
    self.model_data = {}
    self.references = [None]

  def getIDCount(self):
    return self.idCount

  def addModelSite(self, domain_id, rank, users):
    self.model_data[rank] = users

  def getModelRanks(self):
    return [rank+1 for rank in sorted(self.model_data)]

  def getModelUsers(self):
    return [self.model_data[rank] for rank in sorted(self.model_data)]

  def getDomainID(self, domain, insertFlag = False):
    if domain in self.domains:
      self.domains[domain]["exists"] |= insertFlag
      return self.domains[domain]["id"]
    else:
      self.idCount += 1
      entry = self.domains[domain] = {
        "id" : self.idCount,
        "exists" : insertFlag,
        "tags" : {}
      }
      self.references.append(entry)
      return self.idCount

  def addRelatedSite(self, domain, tag, related, weight = 1):
    domainEntry = self.domains[domain]
    related_id = self.getDomainID(related)
    if not tag in domainEntry["tags"]:
      domainEntry["tags"][tag] = []
    domainEntry["tags"][tag].append([related_id, weight])

  def populateRelatedTable(self, session, options):
    print "Populating related table"
    for domain, entry in self.domains.items():
      domain_id = entry["id"];
      for tag, related in entry["tags"].items():
        seen = Set()
        for pair in related:
          if not pair[0] in seen and self.references[pair[0]]["exists"]:
            seen.add(pair[0])
            entry = BucketerRelated(
                      domain_id=domain_id,
                      related_id=pair[0],
                      score=pair[1],
                      source=tag)

            if options.clear_tables:
              session.add(entry)
            else:
              session.merge(entry)

if __name__ == '__main__':
  pass

