def setup_routes(app):
    import splice.web.tiles_admin
    splice.web.tiles_admin.register_routes(app)
