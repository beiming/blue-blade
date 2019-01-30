import os
import random

import xxhash
from flask import json


class Assets:
    def __init__(self, web_path):
        self.static_path = os.path.join(web_path, 'static')

        manifest_file = os.path.join(self.static_path, 'manifest.json')
        self.dev_model = not os.path.exists(manifest_file)

        if not self.dev_model:
            with open(manifest_file, 'r') as f:
                self.asset_file_cache = json.loads(f.read())

        self.asset_hash_cache = {}

    def _asset(self, filename):
        if self.dev_model:
            return '/static/' + filename + '?v=' + str(random.random())

        if filename not in self.asset_file_cache:
            hash_ = self._calculate_asset_hash(filename)
            return '/static/' + filename + (('?v=' + hash_) if hash_ else '')

        return '/static/' + self.asset_file_cache[filename]

    def image(self, key):
        return self._asset('images/' + key)

    def css(self, key):
        a = self._asset('css/' + key)
        print(a)
        return a

    def js(self, key):
        return self._asset('js/' + key)

    def _calculate_asset_hash(self, asset_file):
        if self.dev_model:
            return random.random()

        _hash = self.asset_hash_cache.get(asset_file)

        if not _hash:
            file = os.path.join(self.static_path, asset_file)
            if os.path.isfile(file):
                with open(file, 'rb') as f:
                    data = f.read()
                    _hash = xxhash.xxh64(data).hexdigest()
                    self.asset_hash_cache[asset_file] = _hash

        return _hash
