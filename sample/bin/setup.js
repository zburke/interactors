#!/usr/bin/env node

const { main, MainError } = require('@effection/node');
const rmrfsync = require('rimraf').sync;
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const { messages } = require('./constants');
const { formatErr, formatSuccess, spin } = require('./console-helpers');
const { install } = require('./install');

const SOURCE_DIR = path.dirname(__dirname);
const TARGET_DIR = `${process.cwd()}/'bigtest-sample'`;

async function createDirectory(message) {
  if (fs.existsSync(TARGET_DIR)) {
    throw new MainError({ 
      message: `${formatErr('directory \'bigtest-sample\' already exists')}\n${messages.abort}`
    });
  } else {
    await fsp.mkdir(TARGET_DIR);
    console.log(`\n${formatSuccess(message)}`);
  };
};

function* migrate(messages) {
  yield spin(messages.before, function* () {  
    yield fsp.readdir(SOURCE_DIR).then(files => files.forEach(file => {
      if(file === 'package.json'){
        const {
          name, version, description, repository, author, license, 
          main, scripts, devDependencies, eslintConfig, browserslist,
          babel, jest
        } = require(`${SOURCE_DIR}/${file}`);
  
        scripts.start = 'parcel src/index.html';
  
        const pkgjson = {
          name, version, private: true, description, repository, author, 
          license, main, scripts, devDependencies, eslintConfig, browserslist,
          babel, jest
        };
  
        fs.writeFileSync(`${TARGET_DIR}/package.json`, JSON.stringify(pkgjson, null, 2));
      } else if(file !== 'bin') {
        fs.renameSync(`${SOURCE_DIR}/${file}`, `${TARGET_DIR}/${file}`);
      };
    }));
  });
  console.log(formatSuccess(messages.after));
};

function* installDependencies(messages) {
  yield spin(messages.before, install({ cwd: TARGET_DIR }));
  console.log(formatSuccess(messages.after));
};

function* run() {
  let rollback = true;
  yield createDirectory(messages.creating_dir);
  try {
    yield migrate(messages.organizing_files);
    yield installDependencies(messages.installing_dep);
    console.log(messages.success);
    rollback = false;
  } finally {
    if(rollback){
      rmrfsync(TARGET_DIR);
      console.log(formatSuccess(messages.cleanup));
    };
  };
};

main(run);
