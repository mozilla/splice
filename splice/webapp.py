def setup_routes(app):
    import splice.web.api.reporting
    splice.web.api.reporting.register_routes(app)
