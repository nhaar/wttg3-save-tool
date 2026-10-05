export type KeyRevealMethod = 'none' | 'cptag' | 'cftag' | 'sourcecode' | 'ptag';
export type Page = {
  Filename: string;
  Bookmarked: boolean;
  BookmarkTitle: string | null;
  BookmarkURL: string | null;
  HasKey: boolean;
  RevealMethod: KeyRevealMethod;
  KeyValue: string | null;
  HasVideoFile: boolean;
  FileRevealMethod: KeyRevealMethod;
  VideoFileURL: string | null;
}


export type Site = {
  Name: string;
  Fake: boolean;
  URL: string;
  Visited: boolean;
  Seized: boolean;
  HasKey: boolean;
  KeyString: string | null;
  KeyRevealMethod: KeyRevealMethod;
  KeyPageFileName: string | null;
  HasVideoFile: boolean;
  FileString: string | null;
  FileRevealMethod: KeyRevealMethod;
  FilePageFileName: string | null;
  Pages: Page[];
};

export type Wiki = {
  Name: string;
  URL: string;
  Visited: boolean;
  Seized: boolean;
  Pages: Page[];
  MemberSiteNames: string[];
};

export type Save = {
  // header 1 -> before ModuleBlobs length
  header1: Uint8Array;
  // header 2 -> after ModuleBlobs length until Websites Bytes length
  header2: Uint8Array;
  // header 3 -> after Websites bytes length until savedSites
  header3: Uint8Array;
  savedSites: Site[];
  savedWikis: Wiki[];
  rest: Uint8Array;
};

function fromLE(d: Uint8Array): number {
  let value = 0;
  let exponent = 1;
  d.forEach(byte => {
    value += byte * exponent;
    exponent *= 256;
  });
  return value;
}

export function asciiToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

function parseHeader(d: Uint8Array): [[Uint8Array, Uint8Array, Uint8Array], Uint8Array] {
  const moduleBlobs = asciiToUint8Array('ModuleBlobs');
  const savedSites = Uint8Array.from('SavedSites', char => char.charCodeAt(0));


  let moduleBlobsIndex = -1;
  let savedSitesIndex = -1;

  for (let i = 0; i < d.length - savedSites.length + 1; i++) {
    if (moduleBlobsIndex == -1) {
      if (d[i] === moduleBlobs[0]) {
        let isSubstring = true;
        for (let j = 1; j < moduleBlobs.length; j++) {
          if (d[i + j] != moduleBlobs[j]) {
            isSubstring = false;
            break;
          }
        }
        if (isSubstring) {
          moduleBlobsIndex = i;
        }
      }
    } else {
      if (d[i] == savedSites[0]) {
        let isSubstring = true;
        for (let j = 1; j < savedSites.length; j++) {
          if (d[i + j] != savedSites[j]) {
            isSubstring = false;
            break;
          }
        }
        if (isSubstring) {
          savedSitesIndex = i;
          break;
        }
      }
    }
  }

  if (savedSitesIndex !== -1 && moduleBlobsIndex !== -1) {
    return [
      [
        d.slice(0, moduleBlobsIndex + 0x7A),
        d.slice(moduleBlobsIndex + 0x7E, savedSitesIndex - 0xE),
        d.slice(savedSitesIndex - 0x05, savedSitesIndex)
      ],
        d.slice(savedSitesIndex)
      ];
  }

  throw new Error('Could not find SavedSites');
}

function skipPropertyName(d: Uint8Array, name: string): Uint8Array {
  for (let i = 0; i < name.length; i++) {
    if (d[i] !== name[i]?.charCodeAt(0)) {

      throw new Error(`Incorrect name property when attempting to skip ${name}`);
    }
  }

  return d.slice(name.length + 1 + 4);
}

function parseStrProperty(d: Uint8Array): [string, Uint8Array] {
  const decoder = new TextDecoder('utf-8');

  const strLengthStart = 'StrProperty'.length + 1 + 9;
  const strStart = strLengthStart + 4;
  const strLength = fromLE(d.slice(strLengthStart, strStart));

  const str = decoder.decode(d.slice(strStart, strStart + strLength - 1));
  return [str, d.slice(strStart + strLength + 4)];
}

function parseNullableStrProperty(d: Uint8Array): [string | null, Uint8Array] {
  const decoder = new TextDecoder('utf-8');

  const strLengthStart = 'StrProperty'.length + 1 + 9;
  const strStart = strLengthStart + 4;
  const strLength = fromLE(d.slice(strLengthStart, strStart));

  if (strLength == 0) {
    return [null, d.slice(strStart + strLength + 4)];
  }

  const str = decoder.decode(d.slice(strStart, strStart + strLength - 1));
  return [str, d.slice(strStart + strLength + 4)];
}

function parseBoolProperty(d: Uint8Array): [boolean, Uint8Array] {
  const booleanValueAdress = 'BoolProperty'.length + 9;
  const address = d[booleanValueAdress];
  return [address !== undefined && address > 0, d.slice(booleanValueAdress + 5)];
}
function parseKeyRevealMethodProperty(d: Uint8Array): [KeyRevealMethod, Uint8Array] {
  const start = 'EnumProperty'.length + 9 + 'EWebSiteTapRevealMethod'.length + 9 + '/Script/WTTGSD'.length + 9 + 'ByteProperty'.length + 14 + 'EWebSiteTapRevealMethod::'.length;

  const endingOffset = start + 5;

  let name: string;
  let type: KeyRevealMethod;


  if (d[start] == 0x4e) {
    // N
    name = 'NOT_SET';
    type = 'none';
  } else if (d[start] == 0x53) {
    // S
    name = 'SOURCE_CODE';
    type = 'sourcecode';
  } else if (d[start] == 0x43) {
    // C
    if (d[start + 1] == 0x46) {
      // F
      name = 'CF_TAG';
      type = 'cftag';
    } else {
      name = 'CP_TAG';
      type = 'cptag';
    }
  } else if(d[start] == 0x50) {
    // P
    name = 'P_TAG';
    type = 'ptag';
  } else {
    throw new Error('Unknown key reveal method');
  }

  return [type, d.slice(endingOffset + name.length)];
}

type StructSpec = Array<[string, TypeSpec]>;
type ArrayStructSpec = { type: StructSpec; path: string; name: string; };
type TypeSpec = 'str' | 'bool' | 'str?' | 'keyrevealmethod' | ArrayStructSpec | 'str[]';
type StructPropType<T extends TypeSpec> =
  T extends 'str' ? string :
  T extends 'str?' ? (string | null) :
  T extends 'keyrevealmethod' ? KeyRevealMethod :
  T extends 'bool' ? boolean :
  T extends 'str[]' ? string[] :
  T extends ArrayStructSpec ? StructType<T['type']>[] :
  never;

type StructType<T extends StructSpec> = { [P in T[number] as P[0]]: StructPropType<P[1]> };

function debug(d: Uint8Array): void {
  const dataToShow = [...d.slice(0, d.length < 40 ? d.length : 40)];
  console.log(dataToShow.map(n => n.toString(16)));
}

function parseStruct<T extends StructSpec>(
  d: Uint8Array,
  spec: T
): [StructType<T>, Uint8Array] {
  const values: unknown[] = [];
  let rest = d;
  for (const [prop, type] of spec) {
    const skipped = skipPropertyName(rest, prop);
    let value: unknown;
    if (typeof type === 'object') {
      const atype = type as ArrayStructSpec;
      [value, rest] = parseArrayStruct(skipped, atype.name, atype.path, d => parseStruct(d, atype.type));
    } else {
      if (type === 'str') {
        [value, rest] = parseStrProperty(skipped);
      } else if (type === 'str?') {
        [value, rest] = parseNullableStrProperty(skipped);
      } else if (type === 'bool') {
        [value, rest] = parseBoolProperty(skipped);
      } else if (type === 'keyrevealmethod') {
        [value, rest] = parseKeyRevealMethodProperty(skipped);
      } else if (type === 'str[]') {
        [value, rest] = parseStrArray(skipped)
      } else {
        throw new Error('asda');
      }
    }
    values.push([prop, value]);
  }
  return [Object.fromEntries(values as any) as StructType<T>, rest];
}

function parseSite(d: Uint8Array): [Site, Uint8Array] {
  return parseStruct(d, [
    ['Name', 'str'],
    ['Fake', 'bool'],
    ['URL', 'str'],
    ['Visited', 'bool'],
    ['Seized', 'bool'],
    ['HasKey', 'bool'],
    ['KeyString', 'str?'],
    ['KeyRevealMethod', 'keyrevealmethod'],
    ['KeyPageFileName', 'str?'],
    ['HasVideoFile', 'bool'],
    ['FileString', 'str?'],
    ['FileRevealMethod', 'keyrevealmethod'],
    ['FilePageFileName', 'str?'],
    ['Pages', {
      name: 'SavedWebPage',
      path: '/Script/WTTGSD',
      type: [
        ['Filename', 'str'],
        ['Bookmarked', 'bool'],
        ['BookmarkTitle', 'str?'],
        ['BookmarkURL', 'str?'],
        ['HasKey', 'bool'],
        ['RevealMethod', 'keyrevealmethod'],
        ['KeyValue', 'str?'],
        ['HasVideoFile', 'bool'],
        ['FileRevealMethod', 'keyrevealmethod'],
        ['VideoFileURL', 'str?']
      ]
    }]
  ]) as [Site, Uint8Array];
}

function parseWiki(d: Uint8Array): [Wiki, Uint8Array] {
  return parseStruct(d, [
    ['Name', 'str'],
    ['URL', 'str'],
    ['Visited', 'bool'],
    ['Seized', 'bool'],
    ['Pages', {
      name: 'SavedWebPage',
      path: '/Script/WTTGSD',
      type: [
        ['Filename', 'str'],
        ['Bookmarked', 'bool'],
        ['BookmarkTitle', 'str?'],
        ['BookmarkURL', 'str?'],
        ['HasKey', 'bool'],
        ['RevealMethod', 'keyrevealmethod'],
        ['KeyValue', 'str?'],
        ['HasVideoFile', 'bool'],
        ['FileRevealMethod', 'keyrevealmethod'],
        ['VideoFileURL', 'str?']
      ]
    }],
    ['MemberSiteNames', 'str[]']
  ]) as [Wiki, Uint8Array];
}

function parseStrArray(d: Uint8Array): [string[], Uint8Array] {
  const byteSizeBegin =
    'ArrayProperty'.length +
    1 +
    8 +
    'StrProperty'.length +
    5;

  const lenBegin = byteSizeBegin + 5;
  const lenEnd = lenBegin + 4;
  const elementsBegin = lenEnd + 4;
  
  const bytes = fromLE(d.slice(byteSizeBegin, lenBegin));
  const len = fromLE(d.slice(lenBegin, lenEnd));
  const elementsEnd = elementsBegin + bytes;

  const members: string[] = [];
  let arrayData = d.slice(elementsBegin);

  for (let i = 0; i < len; i++) {
    let j = 0;
    let name = '';
    while (arrayData[j] !== 0x0) {
      name += String.fromCharCode(...arrayData.slice(j, j + 1));
      j++;
    }
    members.push(name);
    arrayData = arrayData.slice(j + 5);
  }

  return [members, d.slice(elementsEnd - 4)];
}

function parseArrayStruct<T>(
  d: Uint8Array,
  structName: string,
  path: string,
  structParser: (d: Uint8Array) => [T, Uint8Array]
): [T[], Uint8Array] {
  const byteSizeBegin =
    'ArrayProperty'.length +
    1 +
    8 +
    'StructProperty'.length +
    1 +
    8 +
    structName.length + 1 + 8 + 
    path.length + 5;

  const lengthBegin = byteSizeBegin + 5;
  const lengthEnd = lengthBegin + 4;

  const bytes = fromLE(d.slice(byteSizeBegin, lengthBegin));
  const length = fromLE(d.slice(lengthBegin, lengthEnd));
  
  const elementsBegin = lengthEnd + 4;

  const elementsEnd = elementsBegin + bytes;

  const members: T[] = [];
  let arrayData = d.slice(elementsBegin, elementsEnd);

  
  for (let i = 0; i < length; i++) {
    const [member, rest] = structParser(arrayData);
    // skip None ... bytes at end
    arrayData = new Uint8Array(rest.slice(9));
    members.push(member);
  }

  return [members, d.slice(elementsEnd - 4)];
}

function parseSites(d: Uint8Array): [Site[], Uint8Array] {
  d = skipPropertyName(d, 'SavedSites');
  return parseArrayStruct(
    d,
    'SavedWebSite',
    '/Script/WTTGSD',
    parseSite
  );
}

function parseWikis(d: Uint8Array): [Wiki[], Uint8Array] {
  d = skipPropertyName(d, 'SavedWikis');
  return parseArrayStruct(d, 'SavedWiki', '/Script/WTTGSD', parseWiki);
}

export function parse(data: Buffer): Save {
  const d = new Uint8Array(data);

  const [[header1, header2, header3], headerLess] = parseHeader(d);
  const [sites, sitesLess] = parseSites(headerLess);
  const [wikis, wikisLess] = parseWikis(sitesLess);

  return {
    header1,
    header2,
    header3,
    savedSites: sites,
    savedWikis: wikis,
    rest: wikisLess
  };
}