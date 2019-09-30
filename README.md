# Pandora project setup process

### General information

The following document describes the setup steps, that needs to be taken in order to setup the project on Sandbox and on PIG instance.

### I. Developer sandbox.
Let's say the we have an empty sandbox (after DBinit) and appropriate IDE installed (Eclipse with sandbox server connection)

##### 1. Sandbox setup
- Checkout the repository
- Go to __./sites/__ and make zip archive of __refapp\_site\_template__ folder
- Upload it manually on the sandbox and make site import

##### 2. Install node packages for compiling client side javascript and sass
Before installing node packages, make sure that the following dependencies are installed :

- NodeJS
- Python
- Visual C++ build tools (if required by python)

On Windows you can install both Python and build tools with
`npm install --global --production windows-build-tools`
It installs Python 2.7. If you need both 2.7 and 3.x you can add Python in path:
Variable: `PYTHON`
Value: `C:\Users\yourName\.windows-build-tools\python27\python.exe`

Proceed with the following shell commands :
- __npm install__

Once the npm packages are installed run the following shell command :
- __npm run build__

Running __npm run build__ command will skip minify/uglify procedures for debugging purposes.
Webpack will compile \*.js and \*.scss files stored in __app\_fspandora\_richUI__ and __app\_checkout__ cartridges.
Sourcemaps will be added inline.
Webpack will watch for changes in js/scss and will compile when change is detected.
All `.bundle.js` files, in folder `cartridge/js` or subfolder, are considered entry points and will be compiled in `cartridge/static/default/js`.
All `.lib.js` and `.min.js` files, in folder `cartridge/js` or subfolder, will be copyed to `cartridge/static/default/js`.

###### Client-side `require` lookup is configured in `webpack.cartridges.config.js`.
You can use direct `require('fileName')` and this will be equivalent to `require('./fileName')` or `require('../../app_fspandora_richUI/js/fileName')`(if used from app_checkout)
This allows client-side overrides in the same way as server-side `*` is used.

###### Trigger build without watching for changes(e.g in Jenkins):
`npm run build-dev`
`npm run build-prod` - With production build sourcemaps are not included and all `.lib.js` files will be minified.

###### Run bundle analyzer:
`npm run analyzer-app_checkout`
`npm run analyzer-app_fspandora_richUI`

###### Run eslint:
`npm run lint`

###### Pre-commit hook:
With node modules installation you will receive pre-commit hook for git. The hook will be activated before each commit.
Actions that will be performed before each commit are described in package.json - section `"lint-staged": `
All staged `.js` files will be validated with eslint after an automated fix is applied. If eslint errors are found the developer is responsible to find and fix them.
All `.js` files under `app_checkout` folder will be formatted with prettier as well as eslint validation. Formatting is automatic.


\* If Eclipse is used as IDE, please check if the following configuration is on : Window -> Preferences -> Workspace -> __Refresh using native hooks or pulling__. It will guarantee that the complied js and css will be automatically uploaded on the sandbox.


### II. PIG instance build setup

Build suite can be used together with CI tool (like Jenkins) for full automation of the build process. No matter what CI tool is used, the following shell commands needs to be executed in order to make build on PIG instance. Assumed that the repository is already pulled locally on the build server.

#####1. Target instance configuration.
Several json configurations needs to updated for proper build process.

- Open or make if missing  ./buildsuite/build/config.json with the following configuration :

```javascript
{
  "dependencies": [
    {
      "repository": {
        "url": "../",
        "type": "file"
      },
      "source": {
        "path": "cartridges",
        "glob": "**/*",
        "ignoreEmpty": false
      },
      "siteImport": {
        "enabled": "true",
        "initPath": "sites/site_config_and_metadata",
        "demoPath": "sites/site_demodata",
        "environmentPath": "sites/config"
      },
      "cartridge": [
        "app_bisn",
        "app_checkout",
        "app_fspandora",
        "app_fspandora_richUI",
        "app_gift_finder",
        "app_pandora_globaldemo",
        "bc_integrationframework",
        "bc_library",
        "bc_pandora",
        "bc_providerAPI",
        "bm_adyen",
        "bm_integrationframework",
        "bm_tools",
        "int_adobemessagecenter",
        "int_adyen",
        "int_baidumap",
        "int_braceletbuilder",
        "int_certona",
        "int_civic",
        "int_coremedia",
        "int_coremedia_c11y",
        "int_fsexacttarget",
        "int_gigya",
        "int_googlecaptcha",
        "int_googlemap",
        "int_mobify",
        "int_navermap",
        "int_nextgenCRM",
        "int_oms"
      ]
    }
  ],

  "environments": {
    "dev10": {
      "server": "${ENVIRONMENT_INSTANCE}",
      "username": "${ENVIRONMENT_USER_NAME}",
      "password": "${ENVIRONMENT_PASSWORD}",

      "two_factor": {
        "enabled": "${ENABLE_TWO_FACTOR}",
        "cert": "${TWO_FACTOR_CERT_PATH}",
        "password": "${TWO_FACTOR_CERT_PASSWORD}",
        "url": "cert.staging.${ENVIRONMENT_INSTANCE}"
      }
    }
  },
  "settings": {
    "project": {
      "name":    "Pandora",
      "version": "${BUILD_TAG_CLEANED}"
    },
    "general": {
      "watch_path": "../cartridges",
      "password_encryption": true,
      "target_environment": "dev10"
    },
    "upload": {
      "cleanup": true,
      "per_cartridge": false,
      "excludehidden": false
    },
    "optimize": {
      "js": false,
      "css": false,
      "concatenate": false
    },
    "siteImport": {
      "enabled": true,
      "filenames": {
        "init": "build-suite-site-template",
        "meta": "build-suite-metadata",
        "content": "refapp_global_content"
      }
    }
  }
}
```

###### Please note that in the example above some of the configuration values are replaced by the CI tool (Jenkins).
#####2. In root folder :

- npm prune (remove modules not listed in package's dependencies list)
- npm install

#####4. Local code build (executed in the root) - compiling *.js and *.scss files.
- npm run build-prod

#####5. Local code deployment preparation (executed in ./buildsuite) - copying the cartridges to output folder. The output folder is archived in a zip file.
- cd buildsuite && \"node_modules/.bin/grunt\" build

#####6. Code upload and activation (executed in ./buildsuite). Once the code zip archive is done with previous step it is uploaded and unziped on the WebDav server in a new folder (new code version). The new code version is activated and the zip file is deleted.
- cd buildsuite && \"node_modules/.bin/grunt\" upload
- cd buildsuite && \"node_modules/.bin/grunt\" activate

#####7. BuildSuite also provides functionality for data and meta data import (executed in ./buildsuite).
For site initialization & configuration settings import and meta-data import only.(default source folder: sites/site_config_and_metadata; meta-data is always read from configuration data: sites/site_config_and_metadata/meta)
- cd buildsuite && \"node_modules/.bin/grunt\" initSite
- cd buildsuite && \"node_modules/.bin/grunt\" importMeta

For complete site import, including demo data (if given) the following can be used:
- cd buildsuite && \"node_modules/.bin/grunt\" initSite
- cd buildsuite && \"node_modules/.bin/grunt\" initDemoSite
- cd buildsuite && \"node_modules/.bin/grunt\" importSite
