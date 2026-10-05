import readline from 'node:readline/promises';
import fs from 'fs';
import path from 'path';

import { DEAD_WEBSITES, REAL_WEBSITES } from './data';
import { parse, type KeyRevealMethod, type Save, type Site } from './parser';
import { emit } from './emitter';
import { BASE_SAV } from './base-sav';

class Main {
  public saveDirectory: string;

  constructor() {
    let localDirectory: string | undefined;
    if (process.env.LOCALAPPDATA !== undefined) {
      localDirectory = path.join(process.env.LOCALAPPDATA, 'WTTGSD/Saved/SaveGames');
      if (!fs.existsSync(localDirectory)) {
        localDirectory = undefined;
      }
    }

    this.saveDirectory = localDirectory ?? process.cwd();
  }
}

const mainProcess = new Main();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function clear() {
  console.log('\x1b[1;1H\x1b[2J');
}

async function wait(): Promise<void> {
  console.log('Press enter to continue...');
  await rl.question('');
}

const chooseOptions = [
  'save',
  'peek',
  'run',
  'prac'
] as const;

type ChooseOption = typeof chooseOptions[number];

async function getOption(): Promise<ChooseOption> {
  const answer = await rl.question('');
  if (!chooseOptions.includes(answer as any)) {
    console.log('Incorrect option, try again ');
    return await getOption();
  }
  return answer as ChooseOption;
}

async function tryLoadFile(file: string, callback: (b: Buffer) => Promise<void>): Promise<void> {
  let data: Buffer;
  try {
    data = fs.readFileSync(file);
  } catch (error) {
    console.log(`Could not open file: ${file}, aborting...`);
    return;
  }

  await callback(data);
}

function revealToString(method: KeyRevealMethod): string {
  return {
    ['none']: 'None',
    ['cptag']: 'CPTAG',
    ['cftag']: 'CFTAG',
    ['ptag']: 'PTAG',
    ['sourcecode']: 'Source Code'
  }[method];
}

function printSaveData(save: Save): void {
  const hasKey: Array<{ page: string; site: string; method: KeyRevealMethod; }> = [];
  const hasFile: Array<{ page: string; site: string; method: KeyRevealMethod; }> = [];

  save.savedSites.forEach(site => {
    if (site.HasKey && site.KeyPageFileName !== null) {
      hasKey.push({ page: site.KeyPageFileName, site: site.Name, method: site.KeyRevealMethod });
    }
    if (site.HasVideoFile && site.FilePageFileName !== null) {
      hasFile.push({ page: site.FilePageFileName, site: site.Name, method: site.FileRevealMethod });
    }
  });

  save.savedWikis.forEach((wiki, i) => {
    const membersSet = new Set(wiki.MemberSiteNames);
    const keys = hasKey.filter(({ site }) => membersSet.has(site)).sort((a, b) => a.site < b.site ? -1 : 1);
    const files = hasFile.filter(({ site }) => membersSet.has(site)).sort((a, b) => a.site < b.site ? -1 : 1);

    console.log(`*** WIKI ${i + 1} ***`);
    console.log(`- Keys (${keys.length})`);
    keys.forEach(({ page, site, method }) => {
      console.log(`-> ${site}: ${page} / ${revealToString(method)}`);
    });

    console.log('\n- Files:');
    files.forEach(({ page, site, method }) => {
      console.log(`-> ${site}: ${page} / ${revealToString(method)}`);
    });
    console.log();
  });
}

async function tryPrintSaveData(file: string): Promise<void> {
  tryLoadFile(file, async (b) => {
    let contents: Save;
    try {
      contents = parse(b);
    } catch (error) {
      console.log('Invalid savefile!');
      return;
    }
    printSaveData(contents);
  });
}

async function setSaveLocation(): Promise<void> {
  console.log(`Current save location: ${mainProcess.saveDirectory}`);
  console.log('Paste the new save location (leave empty to cancel)');
  const answer = await rl.question('');
  if (answer === '') {
    return;
  }
  mainProcess.saveDirectory = answer;
}

async function peekSaveData(): Promise<void> {
  const defaultPath = path.join(mainProcess.saveDirectory, 'WTTGSD.sav');
  console.log(`Read this file? (y/n): ${defaultPath}`);

  const answer = await rl.question('');

  if (answer.toLowerCase() === 'y') {
    clear();
    tryPrintSaveData(defaultPath);
  } else {
    console.log('Paste the file to read: (leave empty to cancel)');
    const answer = await rl.question('');
    if (answer === '') {
      return;
    }

    clear();
    tryPrintSaveData(answer);
  }
}

/** Mutates base save, not great design but not important */
function randomSaveData(base: Save): Save {
  const realWebsites = shuffleArray([...REAL_WEBSITES]).slice(0, 45);
  const deadWebsites = shuffleArray([...DEAD_WEBSITES]).slice(0, 30);

  const fileIndexes = new Set([
    ...shuffleArray(new Array(15).fill(null).map((_, i) => i)).slice(0, 5),
    ...shuffleArray(new Array(15).fill(null).map((_, i) => i + 15)).slice(0, 5),
    ...shuffleArray(new Array(15).fill(null).map((_, i) => i + 30)).slice(0, 5)
  ]);
  
  const keysInWiki = [2, 2, 2];
  keysInWiki[randomInt(0, 2)]! += 1;
  keysInWiki[randomInt(0, 2)]! += 1;
  
  // website index -> key "index"
  const keyIndexes = new Map(shuffleArray([
    ...new Array(3).fill(null).map((_, i) => i).slice(0, keysInWiki[0]),
    ...new Array(3).fill(null).map((_, i) => i + 15).slice(0, keysInWiki[1]),
    ...new Array(3).fill(null).map((_, i) => i + 30).slice(0, keysInWiki[2])
  ]).map((pageIndex, i) => [pageIndex, i + 1]));

  const savedSites: Site[] = [
    ...realWebsites.map((w, i): Site => {
      const keyIndex = keyIndexes.get(i);

      const keyPageIndex = keyIndex === undefined ? null : randomInt(0, w.pages.length);
      const hasFile = fileIndexes.has(i);
      const filePageIndex = hasFile ? randomInt(0, w.pages.length) : null;
      const file = hasFile ? getRandomFile() : null;
      const key = keyIndex === undefined ? null : getRandomKey(keyIndex);
      const keyMethod = keyIndex === undefined ? 'none' : getRandomKeyMethod();
      const fileMethod = filePageIndex === undefined ? 'none' : getRandomFileMethod();

      return {
        Name: w.name,
        Fake: false,
        URL: getRandomLink(),
        Visited: false,
        Seized: false,
        HasKey: keyIndex !== undefined,
        KeyString: key,
        KeyRevealMethod: keyMethod,
        KeyPageFileName: keyPageIndex === 0 ? 'index.html' : keyPageIndex === null ? null : w.pages[keyPageIndex - 1] + '.html',
        HasVideoFile: hasFile,
        FileString: file,
        FileRevealMethod: fileMethod,
        FilePageFileName: filePageIndex === 0 ? 'index.html' : filePageIndex === null ? null : w.pages[filePageIndex - 1] + '.html',
        Pages: ['index', ...w.pages].map((page, i) => ({
          Filename: page + '.html',
          Bookmarked: false,
          BookmarkTitle: null,
          BookmarkURL: null,
          HasKey: keyPageIndex === i,
          RevealMethod: keyPageIndex === i ? keyMethod : 'none',
          KeyValue: keyPageIndex === i ? key : null,
          HasVideoFile: filePageIndex === i,
          FileRevealMethod: filePageIndex === i ? fileMethod : 'none',
          VideoFileURL: filePageIndex === i ? file : null
        }))
      }
    }),
    ...deadWebsites.map((w): Site => ({
      Name: w.name,
      Fake: true,
      URL: getRandomLink(),
      Visited: false,
      Seized: w.seized,
      HasKey: false,
      KeyString: null,
      KeyRevealMethod: 'none',
      KeyPageFileName: null,
      HasVideoFile: false,
      FileString: null,
      FileRevealMethod: 'none',
      FilePageFileName: null,
      Pages: []
    }))
  ];

  const savedWikis = base.savedWikis;

  for (let i = 0; i < 3; i++) {
    savedWikis[i]!.MemberSiteNames = [...realWebsites.slice(15 * i, 15 * (i + 1)), ...deadWebsites.slice(10 * i, 10 * (i + 1))].map(w => w.name).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
  }

  return {
    ...base,
    savedSites,
    savedWikis
  }
}

async function generatePracticeRun(): Promise<void> {
  const baseSave = parse(Buffer.from(BASE_SAV, 'base64'));
  const newSave = randomSaveData(baseSave);

  try {
    const file = path.join(mainProcess.saveDirectory, 'WTTGSD.sav');
    fs.writeFileSync(file, emit(newSave));
    clear();
    console.log(`File outputted to ${file} (Reminder: you must restart the game to detect a new save file)`);

    console.log('Press enter to reveal answers of save file');
    await rl.question('');
    printSaveData(newSave);

  } catch (error) {
    console.error(error);
    console.log('Could not write file');
  }
}

async function getRevealMethod(key: boolean): Promise<KeyRevealMethod> {
  console.log('Type the method');
  console.log('1 - Source Code');
  console.log('2 - CFTAG (Creates a file upon clicked)');
  if (key) {
    console.log('3 - CPTAG (Shows up on the page upon clicked)');
    console.log('4 - PTAG (Shows up on the page without clicking');
  }

  const max = key ? 4 : 2;

  const pick = Number(await rl.question(''));
  const answer = ({
    1: 'sourcecode',
    2: 'cftag',
    3: 'cptag',
    4: 'ptag'
  } as const)[pick];
  if (answer === undefined || pick > max) {
    console.log('Try again.');
    return await getRevealMethod(key);
  } else {
    return answer;
  }
}

async function generatePracticeFile(): Promise<void> {
  console.log('Choose the method that will be used for revealing keys:');
  const keyMethod = await getRevealMethod(true);
  console.log('Choose the method that will be used for revealing files:');
  const fileMethod = await getRevealMethod(false);

  const save = parse(Buffer.from(BASE_SAV, 'base64'));
  makePracticeSave(save, keyMethod, fileMethod);

  try {
    const file = path.join(mainProcess.saveDirectory, 'WTTGSD.sav');
    fs.writeFileSync(file, emit(save));
    clear();
    console.log(`File outputted to ${file} (Reminder: you must restart the game to detect a new save file)`);
  } catch (error) {
    console.error(error);
    console.log('Could not write file');
  }
}

async function loop(): Promise<void> {
  console.log('WTTG3 Save Tool\n');
  clear();
  console.log('Options:');
  console.log(`\`save\` - Set save location [current: ${mainProcess.saveDirectory}]`);
  console.log('`peek` - Peek the save data of a savefile');
  console.log('`run` - Generate randomized practice run');
  console.log('`prac` - Generate practice file with all key/files using the same method and every page containing keys and files');
  console.log();
  console.log('Choose the option: ');

  const option = await getOption();

  clear();

  switch (option) {
    case 'save':
      await setSaveLocation();
      break;
    case 'peek':
      await peekSaveData();
      break;
    case 'prac':
      await generatePracticeFile();
      break;
    case 'run':
      await generatePracticeRun();
      break;
  }

  await wait();
}


async function main() {
  while(true) {
    await loop();
  }
}


main();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max + 1)) + min;
}

function getRandomHex(): string {
  return randomInt(1, 15).toString(16);
}

function getRandomFile(): string {
  return `file://${new Array(32).fill(null).map(() => getRandomHex()).join('')}.fetch`;
}

function getRandomLink(): string {
  return `http://${new Array(32).fill(null).map(() => getRandomHex()).join('')}.ann`;
}

function getRandomKey(index: number): string {
  return `${index} - ${new Array(8).fill(null).map(() => getRandomHex()).join('')}`;
}

function getRandomFileMethod(): KeyRevealMethod {
  return (['cftag', 'sourcecode'] as KeyRevealMethod[])[randomInt(0, 1)]!;
}

function shuffleArray<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5);
}

function getRandomKeyMethod(): KeyRevealMethod {
  return (['cptag', 'cftag', 'ptag', 'sourcecode'] as KeyRevealMethod[])[randomInt(0, 3)]!;
}

function makePracticeSave(base: Save, keyMethod: KeyRevealMethod, fileMethod: KeyRevealMethod): void {
  base.savedSites = [...REAL_WEBSITES].map(w => ({
    Name: w.name,
    Fake: false,
    Visited: false,
    Seized: false,
    HasKey: true,
    URL: getRandomLink(),
    KeyString: 'lmao',
    HasVideoFile: true,
    FileString: 'lmao',
    KeyPageFileName: 'index.html',
    KeyRevealMethod: 'sourcecode',
    FileRevealMethod: 'sourcecode',
    FilePageFileName: 'index.html',
    Pages: ['index', ...w.pages].map(p => ({
      Filename: p + '.html',
      Bookmarked: false,
      BookmarkTitle: null,
      BookmarkURL: null,
      HasKey: true,
      RevealMethod: keyMethod,
      KeyValue: getRandomKey(randomInt(1, 8)),
      HasVideoFile: true,
      FileRevealMethod: fileMethod,
      VideoFileURL: getRandomFile()
    }))
  }));

  base.savedWikis[0]!.MemberSiteNames = REAL_WEBSITES.slice(0, 25).map(w => w.name)
  base.savedWikis[1]!.MemberSiteNames = REAL_WEBSITES.slice(25, 50).map(w => w.name);
  base.savedWikis[2]!.MemberSiteNames = REAL_WEBSITES.slice(50).map(w => w.name);
}