from flask import Response
import ujson
import StringIO
import csv


def build_response(request, it, keys, name=''):
    json = request.args.get('json', False)
    if json == 'True':
        json = True
    headers = request.args.get('headers', True)
    if headers == 'True':
        headers = True
    download = request.args.get('download', False)
    if download == 'True':
        download = True

    if json:
        rval = []
        for tup in it:
            rval.append(dict(zip(keys, tup)))
        response = Response(ujson.dumps(rval), content_type='application/json; charset=utf-8', status=200)
    else:
        buf = StringIO.StringIO()
        writer = csv.writer(buf)
        if headers:
            writer.writerow(keys)
        for tup in it:
            writer.writerow(tup)
        response = Response(buf.getvalue(), content_type='text/csv; charset=utf-8', status=200)

    if download:
        response.headers['Content-Disposition'] = 'attachment; filename=imps_%s.csv' % name
    return response
