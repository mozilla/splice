from splice.environment import Environment


def setup_routes(app):
    import splice.web.views
    splice.web.views.register_routes(app)

    import splice.web.api.authoring
    splice.web.api.authoring.register_routes(app)

    import splice.web.api.upcoming
    splice.web.api.upcoming.register_routes(app)

    import splice.web.api.reporting
    splice.web.api.reporting.register_routes(app)

    import splice.web.api.heartbeat
    splice.web.api.heartbeat.register_routes(app)


def create_webapp(*args, **kwargs):
    env = Environment.instance(*args, **kwargs)
    setup_routes(env.application)
    return env.application
