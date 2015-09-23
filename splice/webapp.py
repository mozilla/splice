from splice.environment import Environment


def setup_routes(app):
    import splice.web.views
    splice.web.views.register_routes(app)

    import splice.web.api.heartbeat
    splice.web.api.heartbeat.register_routes(app)


def create_webapp(*args, **kwargs):
    env = Environment.instance(*args, **kwargs)
    setup_routes(env.application)
    return env.application
