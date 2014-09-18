from setuptools import setup, find_packages
import os

setup(
    name="splice",
    version="1.0.1",
    description="Link authoring tool for " +
                "Firefox Directory and Enhanced Tiles",
    author="Mozilla",
    packages=find_packages(),
    include_package_data=True,
    scripts=["scripts/manage.py"],
)
