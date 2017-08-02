#! /usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const clear = require('clear');

function readDir(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

function format(filename, fullpath) {
  try {
    return fs.statSync(fullpath).isDirectory() ? `${filename} (folder)` : filename;
  } catch (ex) {
    return null;
  }
}

function mountChoices(folder) {
  return new Promise((resolve, reject) => {
    readDir(folder).then(dirs => {
      let data = [
        {
          name: '..',
          value: path.resolve(`${folder}/..`),
          short: '..'
        }
      ];
      dirs.forEach(file => {
        let fullpath = path.resolve(`${folder}/${file}`);
        let name = format(file, fullpath);
        if (name) {
          data.push({
            name: name,
            value: fullpath,
            short: fullpath
          });
        }
      });
      return resolve(data);
    });
  });
}

function getFile(folder, options) {
  folder = folder || '.';
  options = options || {};
  options.question = options.question || 'Choose a file';
  return new Promise((resolve, reject) => {
    clear();
    mountChoices(folder).then(choices => {
      inquirer.prompt([
        {
          type: 'list',
          name: 'dir',
          choices: choices,
          message: options.question
        }
      ]).then(answers => {
        if (fs.statSync(answers.dir).isDirectory()) {
          return resolve(getFile(answers.dir, options));
        }
        return resolve(answers.dir);
      });
    });
  });
}

module.exports = getFile;