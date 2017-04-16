from splice.environment import Environment


# flask_restful doesn't allow multiple initializations
register_flask_restful = False


def setup_routes(app):
    env = Environment.instance()
    global register_flask_restful

    if "signing" in env.config.ALLOWED_APPS:
        import splice.web.api.content
        splice.web.api.content.register_routes(app)

    if "tiles" in env.config.ALLOWED_APPS:
        import splice.web.views
        splice.web.views.register_routes(app)

        import splice.web.api.heartbeat
        splice.web.api.heartbeat.register_routes(app)

        if not register_flask_restful:
            import splice.web.api.init
            splice.web.api.init.register_routes(app)

            import splice.web.api.account
            splice.web.api.account.register_routes(app)

            import splice.web.api.campaign
            splice.web.api.campaign.register_routes(app)

            import splice.web.api.adgroup
            splice.web.api.adgroup.register_routes(app)

            import splice.web.api.tile
            splice.web.api.tile.register_routes(app)

            import splice.web.api.reporting
            splice.web.api.reporting.register_routes(app)

            import splice.web.api.distribution
            splice.web.api.distribution.register_routes(app)

            register_flask_restful = True

    import splice.web.api.heartbeat
    splice.web.api.heartbeat.register_routes(app)


def create_webapp(*args, **kwargs):
    env = Environment.instance(*args, **kwargs)
    setup_routes(env.application)
    return env.application
