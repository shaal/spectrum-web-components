#!/usr/bin/env node

/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { execSync } from 'child_process';

const getChangedPackages = () => {
    const command = execSync(
        './node_modules/.bin/lerna ls --since origin/main --json --loglevel silent'
    );
    const packageList = JSON.parse(command.toString()).reduce((acc, item) => {
        const name = item.name.replace('@spectrum-web-components/', '');
        if (item.location.search('projects') === -1 && name !== 'bundle') {
            acc.push(name);
        }
        return acc;
    }, []);
    return packageList;
};

const testChangedPackages = () => {
    const packages = getChangedPackages();
    let errors = 0;
    packages.forEach((pkg) => {
        try {
            execSync(
                `yarn wtr --group ${pkg} --config web-test-runner.config.ci.js`
            );
        } catch (error) {
            errors += 1;
            if (error.stdout) {
                console.log(error.stdout.toString('utf8'));
            }
        }
    });
    process.exit(errors);
};

testChangedPackages();
