const path = require('path');

module.exports = {
  packagerConfig: {
    icon: path.resolve(__dirname, 'src/assets/icon'), // Brug kun navnet uden .icns/.ico
  },
  rebuildConfig: {},
  makers: [
    // Windows installer (.exe)
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'weatherwidget',
      },
    },

    // Windows ZIP fallback
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },

    // macOS ZIP fallback
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },

    // macOS DMG installer
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        icon: path.resolve(__dirname, 'src/assets/icon.icns'),
        overwrite: true,
        contents: [
          {
            x: 130,
            y: 220,
            type: 'file',
            path: path.resolve(__dirname, 'out', 'MMHI WeatherWidget.app'),
          },
          {
            x: 410,
            y: 220,
            type: 'link',
            path: '/Applications',
          },
        ],
      },
    },

    // Linux (deb-pakke, fx til Ubuntu)
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },

    // Linux (rpm-pakke, fx til Fedora)
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
