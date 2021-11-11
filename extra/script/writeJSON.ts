import { parse } from '@fast-csv/parse';
import * as fs from 'fs';
import * as _ from 'lodash';

const configFile = process.argv[2];

const configRaw = fs.readFileSync(configFile, 'utf8');
const config = JSON.parse(configRaw);

const headers = config.headers;

const ONLY_SPACE = new RegExp('^\\s*$');


interface Entry {
  protocol: string;
  name: string;
}

function deriveID(entry: Entry): string {
  return `${entry.protocol} ${entry.name}`.toUpperCase()
    .split(/\s+/).join('_')
    .replace(/[\\\/]/g, '-');
}

function cleanTags(t) {
  return t.trim();
}

try {
  // Read in the original data
  const sourceFile = config.source;
  const raw = fs.readFileSync(sourceFile, 'utf8')
  let data = JSON.parse(raw)

  // Original data is split by network
  const mainnet = data.mainnet;
  const testnet = data.testnet;

  // Read in our data which adds/overrides any original data.
  const additionsFile = config.additions;
  const additionsData = fs.readFileSync(additionsFile, "utf8");

  // Orig and add are hashes of data
  const mergeData = (orig, add) => {
    const filtered = _(add).omit(["mainnet", "testnet"])
      .omitBy((v, _k) => ONLY_SPACE.test(v))
      .mapValues((v, k) => {
        if (config.arrayFields.includes(k)) {
          return v.split(',');
        } else {
          return v;
        }
      })
      .value();
    
    return {
      ...orig,
      ...filtered,
    }
  };

  function finalize(data) {
    // Add derived ids for anything missing an id.
    let result = data;
    if (config.add_identifiers === true) {
      result = _.forEach(data, (v, _k) => {
        if (v.id === undefined) {
          v.id = deriveID(v);
        }
      });
    }
    return result;
  }

  const processRow = (row) => {
    // The entry in the csv must have an address to overwrite/merge data.
    [['mainnet', mainnet], ['testnet', testnet]].forEach(([net, data]) => {
      const address = row[net];
      let entry = data[address];
      if (address && !ONLY_SPACE.test(address) ) {
        data[address] = mergeData(entry, _.pick(row, headers));
        // Process tags to strip any spaces
        const tags = data[address].tags;
        if (tags !== undefined) {
          data[address].tags = tags.map(cleanTags);
        }
      }
    });
  };

  const stream = parse({ headers: true })
    .on('error', error => console.error(error))
    .on('data', processRow)
    .on('end', (_rowCount: number) => {
      const result = {
        mainnet: finalize(mainnet),
        testnet: finalize(testnet),
      }
      // Write out main net and test net
      console.log("Writing output to", config.output);
      fs.writeFileSync(config.output, JSON.stringify(result, null, 2));
    });
  stream.write(additionsData);
  stream.end();
} catch (err) {
  console.error(err)
}
