/**
 *  @typedef IHanzi
 *  @type {object}
 *  @property {string} symbol hanzi symbol
 *  @property {string} pinyin pinyin transcription of the hanzi
 *  @property {string} meaning hanzi meaning
 *  @property {string|undefined} note optional note
 */

/**
 *  @typedef IData
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

function saveData() {
	localStorage.setItem('hanzimode.data', JSON.stringify(data));
}

/**
	* @param {SubmitEvent} event
	*/
function addItem(event) {
	event.preventDefault();
	/** @type {[HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLTextAreaElement]} */
	const [symbolInput, pinyinInput, meaningInput, noteInput] = event.target;
	const symbol = symbolInput.value;
	const pinyin = pinyinInput.value;
	const meaning = meaningInput.value;
	const note = noteInput.value;

	const index = data.hanzi.findIndex(el => el.symbol === symbol);
	if (~index) {
		data.hanzi.splice(index, 1, { symbol, pinyin, meaning, note });
	} else {
		data.hanzi.push({ symbol, pinyin, meaning, note });
	}
	saveData();

	symbolInput.value = '';
	pinyinInput.value = '';
	meaningInput.value = '';
	noteInput.value = '';
}

let isShowingData = false;

/**
	* @param {Event} event
	*/
function showData(event) {
	if (isShowingData) {
		document.getElementById('dataTable').remove();
		event.target = 'show data';
		isShowingData = false;
		return;
	}

	const footer = document.querySelector('footer');
	const table = document.createElement('table');
	table.id = 'dataTable';

	const headerRow = document.createElement('tr');
	const symbolHeader = document.createElement('th');
	const pinyinHeader = document.createElement('th');
	const meaningHeader = document.createElement('th');
	const noteHeader = document.createElement('th');
	const actionsHeader = document.createElement('th');
	symbolHeader.textContent = 'hànzì';
	pinyinHeader.textContent = 'pinyin';
	meaningHeader.textContent = 'meaning';
	noteHeader.textContent = 'note';
	actionsHeader.textContent = 'actions';

	headerRow.appendChild(symbolHeader);
	headerRow.appendChild(pinyinHeader);
	headerRow.appendChild(meaningHeader);
	headerRow.appendChild(noteHeader);
	headerRow.appendChild(actionsHeader);
	table.appendChild(headerRow);

	for (const { symbol, pinyin, meaning, note } of data.hanzi) {
		const row = document.createElement('tr');

		for (const el of [symbol, pinyin, meaning, note]) {
			const cell = document.createElement('td');
			cell.textContent = el;
			row.appendChild(cell);
		}

		const cell = document.createElement('td');

		const editButton = document.createElement('button');
		editButton.textContent = 'edit';
		cell.appendChild(editButton);

		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'delete';
		cell.appendChild(deleteButton);

		row.appendChild(cell);
		table.appendChild(row);
	}

	footer.appendChild(table);
	event.target.textContent = 'hide data';
	isShowingData = true;
}
