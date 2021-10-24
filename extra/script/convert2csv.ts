import { format } from '@fast-csv/format';
import * as fs from 'fs';
import * as _ from 'lodash';
// Helper script for initial conversion to csv.

const configFile = process.argv[2];

const configRaw = fs.readFileSync(configFile, 'utf8');
const config = JSON.parse(configRaw);

const key = config.key;
const headers = config.headers;

try {
  const sourceFile = config.source;
  const raw = fs.readFileSync(sourceFile, 'utf8')
  const data = JSON.parse(raw)

  const mainnet = data.mainnet;
  const testnet = data.testnet;

  const result = {};
  Object.keys(mainnet).forEach(k => {
    const value = mainnet[k];
    result[value[key]] = {
      ...value,
      mainnet: k,
    }
  })

  Object.keys(testnet).forEach(k => {
    const value = testnet[k];
    const currentValue = result[value[key]] ?? {};
    result[value[key]] = {
      ...currentValue,
      ...value,
      testnet: k,
    }
  })

  const stream = format({ headers: headers });
  stream.pipe(process.stdout);
  Object.keys(result).forEach(k => {
    const values = result[k];
    stream.write(_.pick(values, headers));
  });
  stream.end();
} catch (err) {
  console.error(err)
}
