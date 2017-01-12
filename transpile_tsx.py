#!/usr/local/bin/python3

import os
import re
import subprocess

TSX_ROOT = '.atomist/.editorsTSX'
EDITOR_ROOT = '.atomist/editors'

for tsx in os.listdir(TSX_ROOT):
    tsx_path = os.path.join(TSX_ROOT, tsx)
    out_path = tsx_path.replace('.tsx', '.js')
    target_path = os.path.join(EDITOR_ROOT, os.path.basename(tsx_path).replace('.tsx', '.ts'))
    # Transpile
    print('Transpiling', tsx_path)
    subprocess.run([
        'tsc',
        '--target', 'es6',
        '--jsx', 'react',
        '--removeComments',
        '--reactNamespace', 'JsCode',
        tsx_path
    ])
    # Add member declarations
    with open(out_path, 'r') as infile:
        s = infile.read()
        matches = re.findall(r'this\.([0-9a-zA-Z]+) ?=', s)
        print('Adding member declarations for', matches)
        s = s.replace('constructor()', ';'.join([m + ':any' for m in matches]) + '; constructor()')
    with open(target_path, 'w') as outfile:
        outfile.write(s)
    print('Writing ', target_path)
    # Remove temporary JS file
    os.remove(out_path)
