""" JSON schema definitions for splice

* default schema:
    the imageURI and enhancedImageURI are not re-used, Splice versions prior to
    1.1.19 use this schema
* compact schema:
    the imageURI and enhancedImageURI are re-used, a "URI id" to "URI" mapping
    is stored in the "assets" property
"""

ISO_8061_pattern = (
    '^' + '([\+-]?\d{4})'  # year
    '(' + '-?' + '(0[1-9]|1[0-2])'  # month
    '(' + '-' + '(0[1-9]|[12]\d|3[0-1])' + ')?' + ')?'  # day
    '(T' + '([01]\d|2[0-4])'  # hour
    '(' + ':?' + '([0-5]\d)'  # minute
    '(' + ':' + '([0-5]\d|60)'  # second
    '(' + '(\.\d+)' + ')?' + ')?' + ')?' + ')?'  # microsecond
    '(Z|[\+-]\d{2}(:?\d{2})?)' + '?'  # timezone
    '$'
)

image_uri_pattern = "^data:image/.*$|^https?://.*$"


def _make_common_schema():
    """ Make the JSON schema that has common parts for both default and compact
    schema.
    """
    return {
    "type": "object",
    "patternProperties": {
        "^([A-Za-z]+)/([A-Za-z-]+)$": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "directoryId": {
                        "type": "integer",
                    },
                    "url": {
                        "type": "string",
                        "pattern": "^https?://.*$",
                    },
                    "title": {
                        "type": "string",
                    },
                    "bgColor": {
                        "type": "string",
                        "pattern": "^#[0-9a-fA-F]+$|^rgb\([0-9]+,[0-9]+,[0-9]+\)$|"
                    },
                    "type": {
                        "enum": ["affiliate", "organic", "sponsored"],
                    },
                    "imageURI": {
                        "type": "string",
                    },
                    "enhancedImageURI": {
                        "type": "string",
                    },
                    "check_inadjacency": {
                        "type": "boolean",
                    },
                    "frequency_caps": {
                        "type": "object",
                        "properties": {
                            "daily": {
                                "type": "integer"
                            },
                            "total": {
                                "type": "integer"
                            }
                        },
                        "required": ["daily", "total"]
                    },
                    "frecent_sites": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "pattern": "^.*$"
                        }
                    },
                    "time_limits": {
                        "type": "object",
                        "properties": {
                            "start": {
                                "type": "string",
                                "pattern": ISO_8061_pattern
                            },
                            "end": {
                                "type": "string",
                                "pattern": ISO_8061_pattern
                            },
                        }
                    },
                    "adgroup_name": {
                        "type": "string",
                        "maxLength": 255,
                    },
                    "explanation": {
                        # example: "Suggested for %1$S enthusiasts who visit
                        # sites like %2$S". Both adgroup_name and site_name
                        # are optiobal
                        "type": "string",
                        "maxLength": 255,
                    }
                },
                "required": ["url", "title", "bgColor", "type", "imageURI"],
            }
        }
    },
    "additionalProperties": False,
}


# create the default schema
_default_schema = _make_common_schema()
properties = _default_schema["patternProperties"]["^([A-Za-z]+)/([A-Za-z-]+)$"]["items"]["properties"]
properties["imageURI"]["pattern"] = image_uri_pattern
properties["enhancedImageURI"]["pattern"] = image_uri_pattern

# create the compact schema
_compact_schema = {
    "type": "object",
    "properties": {
        "assets": {
            "type": "object",
            "minProperties": 1,
            "additionalProperties": {
                "type": "string",
                "pattern": image_uri_pattern
            }
        },
        "distributions": _make_common_schema(),
    },
    "required": ["assets", "distributions"],
    "additionalproperties": False,
}


def get_payload_schema(compact=False):
    """ Get the payload's JSON schema based on the compact flag

    params:
        compact: Boolean, specify whether the payload is of compact type or not
    """
    return _compact_schema if compact else _default_schema
