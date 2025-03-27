/**
 * @typedef IHanzi
 *  @type {object}
 *  @property {string} symbol hanzi symbol
 *  @property {string} pinyin pinyin transcription of the hanzi
 *  @property {string} meaning hanzi meaning
 *  @property {string|undefined} note optional note
 */

/**
 * @typedef IData
 *  @type {object}
 *  @property {number} version data version
 *  @property {IHanzi[]} hanzi saved hanzi
 */

/** @type {IData} */
let data = localStorage.getItem('hanzimode.data');
if (data) {
	try {
		data = JSON.parse(data);
	} catch (error) {
		console.error('failed to parse stored data');
		console.error(error);
		data = null;
	}
}

data ||= { version: 1, hanzi: [] };

console.log(data);
