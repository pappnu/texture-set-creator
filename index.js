/* for global variables see
https://z-edit.github.io/#/docs?t=Modules%2FStandard_Modules */

const fs = require('fs');
const path = require('path');

const textureSetCreator = require(`${modulePath}/src/textureSetCreator.js`);

ngapp.run(function (contextMenuFactory, nodeHelpers, settingsService) {
    settingsService.registerSettings({
        label: 'Texture Set Creator Settings',
        templateUrl: `${modulePath}/partials/settings.html`,
        controller: 'settingsController',
        defaultSettings: {
            textureSetCreator: {
                variantNamePosition: 'suffix',
                variantNameFormat: ' - $variant',
            },
        },
    });

    contextMenuFactory.treeViewItems.insertAfter(
        (item) => item.id === 'Automate',
        {
            id: 'textureSetCreator',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Create texture sets',
                    hotkey: '',
                    callback: () =>
                        scope.$emit('openModal', 'configPicker', {
                            templateUrl: `${modulePath}/partials/configPicker.html`,
                            selectedRecords: scope.selectedNodes
                                .filter((node) =>
                                    nodeHelpers.isRecordNode(node)
                                )
                                .map((node) => node.handle),
                        }),
                });
            },
        }
    );
});

ngapp.service('textureSetCreatorService', function (settingsService) {
    this.run = (config, records) => {
        let txCreator = new textureSetCreator(xelib, logger, {
            variantNamePosition:
                settingsService.settings.textureSetCreator.variantNamePosition,
            variantNameFormat:
                settingsService.settings.textureSetCreator.variantNameFormat,
        });
        txCreator.createAndSetTextureSets(config, records);
    };
});

// this code makes the service accessible from
// zEdit scripts and UPF patchers
ngapp.run(function (textureSetCreatorService, interApiService) {
    interApiService.register({
        api: { textureSetCreatorService },
    });
});

ngapp.controller('settingsController', function ($scope) {
    $scope.variantPositions = ['prefix', 'suffix'];
});

ngapp.controller(
    'configPickerModalController',
    function (textureSetCreatorService, progressService, $scope) {
        let configNames = fs.readdirSync(`${modulePath}/configs`);
        let configOptions = configNames.map((item) => {
            return {
                id: path.join(`${modulePath}/configs`, item),
                label: item,
            };
        });
        $scope.configData = {
            selected: configOptions[0],
            options: configOptions,
        };

        $scope.selectFile = () => {
            let selectedFile = fh.selectFile(
                'Select config.',
                `${modulePath}/configs`,
                [{ name: 'JSON', extensions: ['json'] }]
            );
            if (selectedFile) {
                $scope.configData.options.push({
                    id: selectedFile,
                    label: fh.getFileName(selectedFile),
                });
                $scope.configData.selected =
                    $scope.configData.options[
                        $scope.configData.options.length - 1
                    ];
            }
        };

        $scope.apply = () => {
            logger.log('Running Texture Set Creator.');
            try {
                $scope.$emit('closeModal');
                progressService.showProgress({ determinate: false });
                let config = require($scope.configData.selected.id);
                textureSetCreatorService.run(
                    config,
                    $scope.modalOptions.selectedRecords
                );
                logger.log('Texture Set Creator finished.');
                progressService.hideProgress();
            } catch (error) {
                logger.log('Texture Set Creator failed.');
                if (error.name === 'Validation Error') {
                    logger.log(
                        'Config ' +
                            $scope.configData.selected.label +
                            ' is invalid:'
                    );
                    for (let err of error.errors) {
                        logger.log(err.property + ' ' + err.message);
                    }
                } else {
                    logger.log(error.toString());
                }
                progressService.hideProgress();
            }
        };
    }
);
