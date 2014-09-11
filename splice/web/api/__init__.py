from flask import Response
import ujson


def build_response(it, keys):
    rval = []
    for tup in it:
        rval.append(dict(zip(keys, tup)))
    return Response(ujson.dumps(rval), content_type='application/json; charset=utf-8', status=200)
