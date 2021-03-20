module.exports = {
    modelPaths: [
        {
            recordTypes: [], // default
            replacementMethod: 'texture-set',
            references: [],
            paths: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
                },
            ],
        },
        {
            recordTypes: ['AMMO'], // ammunition
            replacementMethod: 'texture-set',
            references: [
                { path: 'DAT2 - Data 2\\Projectile' },
                { path: 'DAT2 - Data 2\\Consumed Ammo' },
            ],
            paths: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
                },
            ],
        },
        {
            recordTypes: ['WEAP'], // weapon
            replacementMethod: 'texture-set',
            references: [
                { path: 'DNAM\\Projectile' },
                {
                    path: 'MWD1 - Model - Mod 1',
                },
                {
                    path: 'MWD2 - Model - Mod 2',
                },
                {
                    path: 'MWD3 - Model - Mod 1 and 2',
                },
                {
                    path: 'MWD4 - Model - Mod 3',
                },
                {
                    path: 'MWD5 - Model - Mod 1 and 3',
                },
                {
                    path: 'MWD6 - Model - Mod 2 and 3',
                },
                {
                    path: 'MWD7 - Model - Mod 1, 2 and 3',
                },
                {
                    path: 'WNAM - 1st Person Model',
                },
                {
                    path: 'WNM1 - 1st Person Model - Mod 1',
                },
                {
                    path: 'WNM2 - 1st Person Model - Mod 2',
                },
                {
                    path: 'WNM3 - 1st Person Model - Mod 1 and 2',
                },
                {
                    path: 'WNM4 - 1st Person Model - Mod 3',
                },
                {
                    path: 'WNM5 - 1st Person Model - Mod 1 and 3',
                },
                {
                    path: 'WNM6 - 1st Person Model - Mod 2 and 3',
                },
                {
                    path: 'WNM7 - 1st Person Model - Mod 1, 2 and 3',
                },
                {
                    path: 'WMI1 - Weapon Mod 1',
                },
                {
                    path: 'WMI2 - Weapon Mod 2',
                },
                {
                    path: 'WMI3 - Weapon Mod 3',
                },
            ],
            models: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
                },
                {
                    filename: 'Shell Casing Model\\MOD2',
                    altTextures: 'Shell Casing Model\\MO2S',
                },
                {
                    filename: 'Scope Model\\MOD3',
                    altTextures: 'Scope Model\\MO3S',
                },
                {
                    filename: 'World Model\\MOD4',
                    altTextures: 'World Model\\MO4S',
                },
            ],
        },
        {
            recordTypes: ['ARMO'], // armor
            replacementMethod: 'texture-set',
            references: [],
            paths: [
                {
                    filename: 'Male biped model\\MODL',
                    altTextures: 'Male biped model\\MODS',
                },
                {
                    filename: 'Male world model\\MOD2',
                    altTextures: 'Male world model\\MO2S',
                },
                {
                    filename: 'Female biped model\\MOD3',
                    altTextures: 'Female biped model\\MO3S',
                },
                {
                    filename: 'Female world model\\MOD4',
                    altTextures: 'Female world model\\MO4S',
                },
            ],
        },
        {
            recordTypes: ['ARMA'], // armor Addon
            replacementMethod: 'texture-set',
            references: [],
            paths: [
                {
                    filename: 'Male biped model\\MODL',
                    altTextures: 'Male biped model\\MODS',
                },
                {
                    filename: 'Male world model\\MOD2',
                    altTextures: 'Male world model\\MO2S',
                },
                {
                    filename: 'Female biped model\\MOD3',
                    altTextures: 'Female biped model\\MO3S',
                },
                {
                    filename: 'Female world model\\MOD4',
                    altTextures: 'Female world model\\MO4S',
                },
            ],
        },
        {
            recordTypes: ['SCOL'], // static collection
            replacementMethod: 'texture-set',
            references: [{ path: 'Parts', subPaths: [{ path: 'ONAM' }] }],
            paths: [
                {
                    filename: 'Model\\MODL',
                    altTextures: 'Model\\MODS',
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
    },
};
