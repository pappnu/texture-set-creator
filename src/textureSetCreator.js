const path = require('path');

const nifTexturesReader = require('nif-textures-reader');

const gameSpecificPaths = require('./constants/gameSpecificPaths.js');
const configSchema = require('./constants/configSchema.json');
const { Validator } = require('jsonschema');

module.exports = class textureSetCreator {
    constructor(
        xelib,
        logger,
        {
            variantNamePosition = 'suffix',
            variantNameFormat = ' - $variant',
        } = {}
    ) {
        this.xelib = xelib;
        this.logger = logger;

        this.variantNamePosition = variantNamePosition;
        this.variantNameFormat = variantNameFormat;

        this.gameMode = 'gm' + this.xelib.GetGlobal('AppName');
        this.gameModeIndex = this.xelib.gameModes.findIndex(
            (item) => item === this.gameMode
        );

        this.gamePath = this.xelib.GetGamePath(this.gameModeIndex);
        this.meshesPath = path.join(this.gamePath, 'data', 'meshes');

        if (gameSpecificPaths.hasOwnProperty(this.gameMode)) {
            this.gameModelRecordPaths =
                gameSpecificPaths[this.gameMode].modelPaths;
            this.textureIndexMapping =
                gameSpecificPaths[this.gameMode].textureIndexMapping;
        } else {
            throw new Error(
                'Texture Set Creator is not compatible with ' +
                    this.xelib.GetGlobal('AppName')
            );
        }
    }

    createAndSetTextureSets(sets, records) {
        this.validateConfig(sets);

        let textureSetTemplates = this.formTemplates(sets, records);

        //this.logger.log(JSON.stringify(textureSetTemplates, null, 2));

        let txSetsAndRecords = this.setTextureSets(textureSetTemplates);

        this.updateLinks(txSetsAndRecords.createdRecords);
    }

    formTemplates(sets, records) {
        let textureSetTemplates = [];

        for (let set of sets) {
            let recordSet = {
                name: set.name,
                records: [],
            };

            for (let record of records) {
                let container = this.xelib.GetContainer(record);

                if (container) {
                    let containerSig = this.xelib.Signature(container);
                    let modelPaths = this.gameModelRecordPaths.find((item) =>
                        item.recordTypes.includes(containerSig)
                    );
                    if (!modelPaths) {
                        modelPaths = this.gameModelRecordPaths.find(
                            (item) => item.recordTypes.length === 0
                        );
                    }

                    if (this.xelib.EditorID(record).contains(set.searchTerm)) {
                        let recordTextureSets = this.formTextureSets(
                            record,
                            modelPaths.paths,
                            set.variants
                        );
                        if (recordTextureSets.variants.length) {
                            recordSet.records.push(recordTextureSets);
                        }
                    }
                }
            }

            textureSetTemplates.push(recordSet);
        }

        return textureSetTemplates;
    }

    formTextureSets(record, modelPaths, variants) {
        let recordConfig = {
            record: record,
            variants: [],
        };

        for (let variant of variants) {
            let variantConfig = {
                name: variant.name,
                models: [],
            };

            recordConfig.variants.push(variantConfig);
        }

        for (let model of modelPaths) {
            let nifPath = this.xelib.GetValue(record, model.filename);
            if (nifPath) {
                nifPath = path.join(this.meshesPath, nifPath);
                let shapes = nifTexturesReader.read(nifPath);

                shapes.sort((a, b) => a.index - b.index);
                let idx = 0;
                shapes = shapes.map((item) => {
                    item.index = idx++;
                    return item;
                });

                for (let variantConfig of recordConfig.variants) {
                    let modelConfig = {
                        altTexturesPath: model.altTextures,
                        shapes: [],
                    };

                    for (let shape of shapes) {
                        let textureValues = Object.values(shape.textures);
                        let variant = variants.find(
                            (item) => item.name === variantConfig.name
                        );
                        if (
                            variant.textures.some((item) => {
                                let origPath = path
                                    .normalize(item.original)
                                    .toLowerCase();
                                return textureValues.some((tex) => {
                                    let texPath = path
                                        .normalize(tex)
                                        .toLowerCase();
                                    return texPath.endsWith(origPath);
                                });
                            })
                        ) {
                            let shapeConfig = {
                                name: shape.name,
                                index: shape.index,
                                textures: [],
                            };

                            for (let key in shape.textures) {
                                let replacementConfig = {
                                    index: key,
                                    path: '',
                                };

                                let texturePathNorm = path
                                    .normalize(shape.textures[key])
                                    .toLowerCase();

                                let replacement = variant.textures.find(
                                    (item) =>
                                        texturePathNorm.endsWith(
                                            path
                                                .normalize(item.original)
                                                .toLowerCase()
                                        )
                                );

                                // Texture sets assume, that the textures
                                // are under the textures folder, so remove
                                // that folder from the path
                                let originalDir = path.dirname(texturePathNorm);
                                if (originalDir.startsWith('textures\\')) {
                                    originalDir = originalDir.replace(
                                        'textures\\',
                                        ''
                                    );
                                }

                                if (replacement) {
                                    replacementConfig.path = path.join(
                                        originalDir,
                                        path
                                            .normalize(replacement.new)
                                            .toLowerCase()
                                    );
                                } else if (shape.textures[key]) {
                                    replacementConfig.path = path.join(
                                        originalDir,
                                        path
                                            .basename(shape.textures[key])
                                            .toLowerCase()
                                    );
                                }

                                shapeConfig.textures.push(replacementConfig);
                            }

                            modelConfig.shapes.push(shapeConfig);
                        }
                    }

                    if (modelConfig.shapes.length) {
                        variantConfig.models.push(modelConfig);
                    }
                }
            }
        }

        recordConfig.variants = recordConfig.variants.filter(
            (item) => item.models.length > 0
        );

        return recordConfig;
    }

    setTextureSets(textureSetTemplates) {
        let createdTextureSets = [];
        let createdRecords = [];

        for (let recordSet of textureSetTemplates) {
            for (let record of recordSet.records) {
                let recordElement = record.record;
                let plugin = this.xelib.GetElementFile(recordElement);

                for (let variant of record.variants) {
                    let counter = -1;

                    let newRecord = this.xelib.CopyElement(
                        recordElement,
                        plugin,
                        true
                    );
                    createdRecords.push({
                        record: newRecord,
                        variant: variant.name,
                    });

                    this.xelib.SetValue(
                        newRecord,
                        'EDID',
                        this.xelib.EditorID(recordElement) + '_' + variant.name
                    );

                    let origName = this.xelib.FullName(recordElement);
                    if (origName) {
                        let newName = origName;
                        let variantAddition = this.variantNameFormat.replace(
                            '$variant',
                            variant.name
                        );
                        switch (this.variantNamePosition) {
                            case 'prefix':
                                newName = variantAddition + newName;
                                break;
                            case 'suffix':
                                newName = newName + variantAddition;
                                break;
                            default:
                                break;
                        }
                        this.xelib.SetValue(newRecord, 'FULL', newName);
                    }

                    for (let model of variant.models) {
                        let altTexturesElement = this.xelib.AddElement(
                            newRecord,
                            model.altTexturesPath
                        );
                        this.xelib.SetValue(altTexturesElement, '', '');
                        while (
                            this.xelib.HasArrayItem(
                                altTexturesElement,
                                '',
                                '',
                                ''
                            )
                        ) {
                            this.xelib.RemoveArrayItem(
                                altTexturesElement,
                                '',
                                '',
                                ''
                            );
                        }

                        for (let shape of model.shapes) {
                            let altTexShape = this.xelib.AddArrayItem(
                                altTexturesElement,
                                '',
                                '',
                                ''
                            );

                            this.xelib.AddElementValue(
                                altTexShape,
                                '3D Name',
                                shape.name
                            );
                            this.xelib.AddElementValue(
                                altTexShape,
                                '3D Index',
                                shape.index.toString()
                            );

                            let texSetElement;
                            let texSetElements = [];
                            let texSetContainer = this.xelib.GetElement(
                                plugin,
                                'TXST'
                            );
                            if (texSetContainer) {
                                texSetElements = this.xelib.GetElements(
                                    plugin,
                                    'TXST'
                                );
                                //let texSetElement = findTextureSet(shape["textures"], createdTextureSets);
                                texSetElement = this.findTextureSet(
                                    shape.textures,
                                    texSetElements
                                );
                            }

                            if (!texSetElement) {
                                if (counter < 0) {
                                    counter = this.initCounter(
                                        texSetElements,
                                        recordSet.name,
                                        variant.name
                                    );
                                }

                                texSetElement = this.createTextureSet(
                                    plugin,
                                    shape.textures,
                                    recordSet.name +
                                        '_' +
                                        variant.name +
                                        '_' +
                                        counter
                                );
                                createdTextureSets.push(texSetElement);
                                counter++;
                            }

                            this.xelib.SetValue(
                                altTexShape,
                                'New Texture',
                                this.xelib.LongName(texSetElement)
                            );
                        }
                    }
                }
            }
        }

        return { createdTextureSets, createdRecords };
    }

    findTextureSet(textures, textureSets) {
        for (let ts of textureSets) {
            let texturesElement = this.xelib.GetElement(ts, 'Textures (RGB/A)');
            let match = false;
            for (let texTypeKey in this.textureIndexMapping) {
                let texture = textures.find(
                    (tex) => tex.index + '' === texTypeKey
                );
                if (!texture) {
                    texture = '';
                }
                let existingTexPath = this.xelib.GetValue(
                    texturesElement,
                    this.textureIndexMapping[texTypeKey]
                );
                if (texture.path && existingTexPath) {
                    if (
                        !texture.path.localeCompare(
                            existingTexPath,
                            undefined,
                            {
                                sensitivity: 'base',
                            }
                        )
                    ) {
                        match = true;
                    } else {
                        match = false;
                        break;
                    }
                } else if (!texture.path && !existingTexPath) {
                    match = true;
                } else {
                    match = false;
                    break;
                }
            }

            if (match) {
                return ts;
            }
        }

        return undefined;
    }

    createTextureSet(plugin, textures, name) {
        let newTxSet = this.xelib.AddElement(plugin, 'TXST\\TXST');
        this.xelib.AddElementValue(newTxSet, 'EDID', name);

        for (let index in this.textureIndexMapping) {
            let texture = textures.find(
                (item) => item.index.toString() === index.toString()
            );
            if (texture.path) {
                this.xelib.AddElementValue(
                    newTxSet,
                    'Textures (RGB/A)\\' + this.textureIndexMapping[index],
                    texture.path
                );
                this.xelib.AddElementValue(newTxSet, 'DNAM', '');
            }
        }

        return newTxSet;
    }

    initCounter(textureSets, setName, variant) {
        let setTextureSetNumbers = [];
        for (let txSet of textureSets) {
            let txSetName = this.xelib.EditorID(txSet);
            if (txSetName.contains(setName + '_' + variant + '_')) {
                let number = parseInt(
                    txSetName.split(setName + '_' + variant + '_')[1],
                    10
                );
                if (typeof number === 'number') {
                    setTextureSetNumbers.push(number);
                }
            }
        }
        if (setTextureSetNumbers.length > 0) {
            setTextureSetNumbers.sort((a, b) => {
                return b - a;
            });
            return setTextureSetNumbers[0] + 1;
        }

        return 0;
    }

    updateLinks(records) {
        for (let record of records) {
            let containerSig = this.xelib.Signature(
                this.xelib.GetContainer(record.record)
            );
            let modelPaths = this.gameModelRecordPaths.find((item) =>
                item.recordTypes.includes(containerSig)
            );
            if (!modelPaths) {
                modelPaths = this.gameModelRecordPaths.find(
                    (item) => item.recordTypes.length === 0
                );
            }
            this.setLinks(record.record, record.variant, modelPaths.references);
        }
    }

    setLinks(record, variantName, references) {
        let plugin = this.xelib.GetElementFile(record);
        for (let ref of references) {
            if (ref.hasOwnProperty('subPaths') && ref.subPaths.length > 0) {
                let subRoot = this.xelib.GetElement(record, ref.path);
                if (subRoot) {
                    let subRecords = this.xelib.GetElements(subRoot);
                    for (let subRecord of subRecords) {
                        this.setLinks(subRecord, variantName, ref.subPaths);
                    }
                }
            }

            let origRefs = [];
            try {
                origRefs = this.xelib.GetElements(record, ref.path);
            } catch (error) {
                let origRef = this.xelib.GetElement(record, ref.path);
                if (origRef) {
                    origRefs.push(origRef);
                }
            }

            for (let origRef of origRefs) {
                let origLink = this.xelib.GetLinksTo(origRef, '');
                let linkSig = this.xelib.Signature(
                    this.xelib.GetContainer(origLink)
                );
                let linksContainer = this.xelib.GetElement(plugin, linkSig);
                if (linksContainer) {
                    let linkCandidates = this.xelib.GetElements(
                        linksContainer,
                        ''
                    );
                    let matchingVariant = linkCandidates.find(
                        (elem) =>
                            this.xelib.EditorID(elem) ===
                            this.xelib.EditorID(origLink) + '_' + variantName
                    );
                    if (matchingVariant) {
                        this.xelib.SetLinksTo(
                            record,
                            matchingVariant,
                            this.xelib.LocalPath(origRef)
                        );
                    }
                }
            }
        }
    }

    validateConfig(config) {
        let validator = new Validator();
        validator.validate(config, configSchema, { throwAll: true });
    }
};
