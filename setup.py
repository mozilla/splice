from setuptools import setup, find_packages

setup(
    name="splice",
    version="2.1.47",
    description="Link authoring tool for " +
                "Firefox Directory and Enhanced Tiles",
    author="Mozilla",
    packages=find_packages(),
    include_package_data=True,
    scripts=["scripts/manage.py", "scripts/tile_index_crawl.py",
             "scripts/rs_to_pg.py", "scripts/index_walker.py",
             "scripts/expire_redshift_data.py",
             "scripts/compress_redshift_daily.sql"],
)
