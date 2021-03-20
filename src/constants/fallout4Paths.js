module.exports = {
    modelPaths: [
        {
            recordTypes: [], // default
            replacementMethod: 'material-swap',
            references: [],
            paths: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
                },
            ],
        },
        {
            recordTypes: ['BOOK'], // book
            replacementMethod: 'material-swap',
            references: [{ path: 'INAM' }],
            paths: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
                },
            ],
        },
        {
            recordTypes: ['FLOR', 'TREE'], // flora, tree
            replacementMethod: 'material-swap',
            references: [{ path: 'PFIG' }],
            paths: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
                },
            ],
        },
        {
            recordTypes: ['OMOD'], // Object modification
            replacementMethod: 'material-swap',
            references: [{ path: 'LNAM' }],
            paths: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
                },
            ],
        },
        {
            recordTypes: ['WEAP'], // weapon
            replacementMethod: 'material-swap',
            references: [
                { path: 'DNAM\\Ammo' },
                {
                    path: 'Object Template\\Combinations',
                    subPaths: [
                        { path: 'OBTS\\Includes', subPaths: [{ path: 'Mod' }] },
                    ],
                },
            ],
            models: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
                },
                {
                    filename: '1st Person Model\\MOD4',
                    altTextures: '1st Person Model\\MO4S',
                },
            ],
        },
        {
            recordTypes: ['ARMO'], // armor
            replacementMethod: 'material-swap',
            references: [{ path: 'Models', subPaths: [{ path: 'MODL' }] }],
            paths: [
                {
                    filename: 'Male world model\\MOD2',
                    altTextures: 'Male world model\\MO2S',
                },
                {
                    filename: 'Female world model\\MOD4',
                    altTextures: 'Female world model\\MO4S',
                },
            ],
        },
        {
            recordTypes: ['ARMA'], // armor Addon
            replacementMethod: 'material-swap',
            references: [{ path: 'ONAM' }],
            paths: [
                {
                    filename: 'Male world model\\MOD2',
                    altTextures: 'Male world model\\MO2S',
                },
                {
                    filename: 'Female world model\\MOD3',
                    altTextures: 'Female world model\\MO3S',
                },
                {
                    filename: 'Male 1st Person\\MOD4',
                    altTextures: 'Male 1st Person\\MO4S',
                },
                {
                    filename: 'Female 1st Person\\MOD5',
                    altTextures: 'Female 1st Person\\MO5S',
                },
            ],
        },
    ],
    // "Nif texture index": "Corresponding key in texture set"
    textureIndexMapping: {
        0: 'TX00', // Diffuse
        1: 'TX01', // Normal/Gloss
        2: 'TX03', // Glow/Detail Map
        3: 'TX04', // Height/Parallax
        4: 'TX05', // Environment
        5: 'TX02', // Environment Mask/Subsurface Tint
        6: 'TX06', // Subsurface for Multilayer Parallax
        7: 'TX07', // Backlight Mask/Specular
    },
};
