# Texture Set Creator

A zEdit module for creating and applying texture sets. Texture sets are created
by replacing existing texture paths in models of chosen records according to
user defined replacement rules. Records which include models with textures that
should be replaced will be duplicated and the new texture sets will be assigned
to them.

## Installation

Node and [zEdit](https://github.com/z-edit/zedit) are required. For compiling
some of the dependencies a working
[CMake.js](https://github.com/cmake-js/cmake-js) installation is required.

1. Clone this repository to zEdit `modules` directory.
2. Run `npm install`.

## Usage

Select the records to process in the zEdit Tree View and then choose **Create
texture sets** from the context menu, which can be opened with right mouse
button. This opens a dialog which allows selecting a config which will be used
to determine what texture sets should be created. Once the desired config is
selected the process can be started by pressing OK. Once the process has
finished the Tree View needs to be interacted with (e.g. by resorting) for the
new records to show up.

Make sure that the models that should be processed are available as loose files.
Reading from archives isn't currently supported.

The configs are JSON files and they should conform to the following JSON format:
```
[
    {
        "name": "name of the set",
        "searchTerm": "used to search records",
        "variants": [
            {
                "name": "Variant name",
                "textures": [
                    {
                        "original": "original_texture_name.dds",
                        "new": "new_texture_name.dds"
                    },
                    {
                        "original": "path/to/another_original_texture.dds",
                        "new": "/path/to/replacement_texture.dds"
                    }
                ]
            },
            {
                "name": "Another variant",
                "textures": [
                    {
                        "original": "original.dds",
                        "new": "something/new.dds"
                    }
                ]
            },
        ]
    },
    {
        "name": "another set",
        "searchTerm": "",
        "variants": [
            {
                "name": "Variant name",
                "textures": [
                    {
                        "original": "partial/path/to/original_texture.dds",
                        "new": "new.dds"
                    }
                ]
            },
        ]
    }
]
```

The `name` fields are used to name the new records and the set + variant name
combinations should be unique to avoid conflicts. The variants of a set are
applied only to records which editor ID includes the string defined by
`searchTerm`.

Texture paths in a model that end with the string defined by `original` will be
replaced with the texture defined by `new` in the resulting texture set. The
`new` field can either include only the filename of the new texture in which
case the original texture directory will be used or the full path to the
texture file starting from the game's texture directory.

When an invalid config is used the module will print an error message, which can
be inspected in the zEdit Log View. Configs placed in the module's **configs**
directory will be automatically added to the dropdown menu in the config picking
dialog.

See the wiki page for a basic use case [example](https://github.com/pappnu/texture-set-creator/wiki/Example-use-case).

## Libraries used

- [nifly](https://github.com/ousnius/nifly)
- [JSON for Modern C++](https://github.com/nlohmann/json)
- [jsonschema](https://github.com/tdegrunt/jsonschema)

## License

MIT
