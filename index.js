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

/**
 * @typedef IHanziKey
 * @type {'symbol'|'pinyin'|'meaning'}
 */

/**
 * @typedef ITarget
 * @type {object}
 * @property {IHanzi} hanzi current hanzi
 * @property {IHanziKey} type the displayed target
 * @property {IHanziKey} input1Type first input expected type
 * @property {IHanziKey} input2Type second input expected type
 */

/** @type {IData} */
let data = { version: '1', hanzi: [] };
let isShowingData = false;

let isLooping = false;
/** @type {IHanzi[]} */
let toBeLooped = [];
/** @type {string[]} */
let loopedThrough = [];
/** @type {ITarget|undefined} */
let currentTarget;

const allowedTargets = ['symbol', 'pinyin', 'meaning'];

const _version = localStorage.getItem('hanzimode.version');
if (!_version) {
	console.warn('no version detected, won\'t try reading stored data');
	localStorage.setItem('hanzimode.version', data.version);
} else if (_version !== data.version) {
	alert('mismatched versions');
} else {
	const _hanzi = localStorage.getItem('hanzimode.data');
	if (_hanzi) {
		try {
			data.hanzi = JSON.parse(_hanzi);
		} catch (error) {
			console.error('failed to parse stored data');
			console.error(error);
		}
	}
}

updateLoopStatus();
function updateLoopStatus() {
	document.getElementById('loopStatus').textContent = isLooping
		? `${loopedThrough.length} / ${data.hanzi.length}`
		: data.hanzi.length;
}

function saveData() {
	localStorage.setItem('hanzimode.data', JSON.stringify(data.hanzi));
	localStorage.setItem('hanzimode.version', data.version);
}

/**
	* @param {SubmitEvent} event
	*/
function addItem(event) {
	event.preventDefault();
	/** @type {[HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLTextAreaElement]} */
	const [symbolInput, pinyinInput, meaningInput, noteInput] = event.target;

	const item = {
		symbol: symbolInput.value.trim(),
		pinyin: pinyinInput.value.trim(),
		meaning: meaningInput.value.trim(),
		note: noteInput.value.trim(),
	};

	const index = data.hanzi.findIndex(h => h.symbol === item.symbol);
	const addNew = index === -1;
	if (addNew) {
		data.hanzi.push(item);
		updateLoopStatus();
	} else {
		data.hanzi.splice(index, 1, item);
	}
	saveData();

	if (isShowingData) {
		if (addNew) {
			addDataRow(document.getElementById('dataTable').children.item(1), item);
		} else {
			const row = document.getElementById(`data-${item.symbol}`);
			row.children.item(1).textContent = item.pinyin;
			row.children.item(2).textContent = item.meaning;
			row.children.item(3).textContent = item.note;
		}
	}

	symbolInput.value = '';
	pinyinInput.value = '';
	meaningInput.value = '';
	noteInput.value = '';
}

/**
	* @param {Event} event
	*/
function toggleData(event) {
	if (isShowingData) {
		const table = document.getElementById('dataTable');
		const thead = table.firstElementChild.cloneNode(true);
		table.style.display = 'none';
		table.innerHTML = '';
		table.appendChild(thead);
		event.target.textContent = 'show data';
	} else {
		showData();
		event.target.textContent = 'hide data';
	}
	isShowingData = !isShowingData;
}

function showData() {
	const table = document.getElementById('dataTable');
	table.style.display = '';

	const tbody = document.createElement('tbody');
	for (const item of data.hanzi) {
		addDataRow(tbody, item);
	}
	table.appendChild(tbody);
}

/**
 * @param {HTMLTableSectionElement} tbody
 * @param {IHanzi} hanzi
 */
function addDataRow(tbody, { symbol, pinyin, meaning, note }) {
	const row = Object.assign(document.createElement('tr'), { id: `data-${symbol}` });

	for (const property of [symbol, pinyin, meaning, note]) {
		const cell = Object.assign(document.createElement('td'), { textContent: property });
		row.appendChild(cell);
	}

	const actionsCell = document.createElement('td');
	const editButton = Object.assign(document.createElement('button'), { textContent: 'edit' });
	editButton.addEventListener('click', () => {
		document.getElementById('dataForm').scrollIntoView();
		const item = data.hanzi.find(h => h.symbol === symbol);
		document.getElementById('dataInputSymbol').value = item.symbol;
		document.getElementById('dataInputPinyin').value = item.pinyin;
		document.getElementById('dataInputMeaning').value = item.meaning;
		document.getElementById('dataInputNote').value = item.note;
	});
	actionsCell.appendChild(editButton);

	const deleteButton = Object.assign(document.createElement('button'), { textContent: 'delete' });
	deleteButton.addEventListener('click', () => {
		const proceed = confirm(`delete ${symbol}`);
		if (proceed) {
			const index = data.hanzi.findIndex(item => item.symbol === symbol);
			if (~index) {
				data.hanzi.splice(index, 1);
				saveData();
				row.remove();
				updateLoopStatus();
			}
		}
	});
	actionsCell.appendChild(deleteButton);
	row.appendChild(actionsCell);

	tbody.appendChild(row);
}

function exportData() {
	const content = JSON.stringify(data);
	const blob = new Blob([content], { type: 'application/json' });
	const href = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement('a'), {
		href,
		download: 'hanzimode.json',
	});
	a.click();
	URL.revokeObjectURL(href);
}

/** @param {InputEvent} event */
async function importData(event) {
	const [file] = event.target.files;
	if (file) {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				/** @type IData */
				const parsed = JSON.parse(reader.result);
				if (!parsed.version) {
					throw new Error('no version', reader.result);
				} else if (parsed.version !== data.version) {
					throw new Error('mismatched version');
				} else if (!parsed.hanzi || !Array.isArray(parsed.hanzi)) {
					throw new Error('invalid hanzi');
				}
				data = parsed;

				if (isShowingData) {
					document.getElementById('dataTable').remove();
					showData();
				}

				saveData();
				updateLoopStatus();
				event.target.value = '';
			} catch (e) {
				console.error(e);
				alert(e);
			}
		};
		reader.onerror = () => {
			console.error('reader error', reader.error);
			alert('failed to read file');
		};
		reader.readAsText(file);
	}
}

/** @param {Event} event target is startOrResetLoop btn */
function startOrResetLoop(event) {
	if (isLooping && toBeLooped.length > 0 && !confirm('are you sure?')) {
		return;
	} else if (!isLooping) {
		event.target.textContent = 'reset loop';
	}

	isLooping = true;
	loopedThrough = [];
	toBeLooped = [...data.hanzi];
	for (let i = toBeLooped.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[toBeLooped[i], toBeLooped[j]] = [toBeLooped[j], toBeLooped[i]];
	}
	console.log(toBeLooped.map(c => c.symbol));

	document.body.classList.add('looping');
	document.getElementById('stopLoop').style.display = '';

	updateLoopStatus();
	nextTarget();
}

/** @param {Event} event target is stopLoop btn */
function stopLoop(event) {
	if (!confirm('are you sure?')) {
		return;
	}

	isLooping = false;
	loopedThrough = [];
	toBeLooped = [];

	document.getElementById('startOrResetLoop').textContent = 'start loop';
	document.body.classList.remove('looping');
	event.target.style.display = 'none';
	document.querySelector('main').innerHTML = '';

	updateLoopStatus();
}

/** @param {string} type */
function targetTypeLabel(type) {
	return type === 'symbol' ? 'hànzì' : type;
}

/** @param {Event} event target is next button */
function nextTarget(event) {
	if (currentTarget) {
		loopedThrough.push(currentTarget.symbol);
		toBeLooped.pop();
	}

	currentTarget = { hanzi: toBeLooped[toBeLooped.length - 1] };
	const chooseFrom = [...allowedTargets];
	currentTarget.type = chooseFrom.splice(Math.floor(Math.random() * chooseFrom.length), 1)[0];

	document.getElementById('loopTarget').textContent = currentTarget.hanzi[currentTarget.type];

	const randomIndex = Math.random() > 0.5 ? 1 : 0;
	currentTarget.input1Type = chooseFrom[randomIndex];
	currentTarget.input2Type = chooseFrom[1 - randomIndex];

	const input1 = document.getElementById('loopInput1');
	input1.value = '';
	// TODO cant use textContent it disappears input
	input1.parentElement.textContent = targetTypeLabel(currentTarget.input1Type);

	const input2 = document.getElementById('loopInput2');
	input2.value = '';
	// TODO cant use textContent it disappears input
	input2.parentElement.textContent = targetTypeLabel(currentTarget.input2Type);

	if (!toBeLooped.length) {
		event.target.setAttribute('disabled', 'true');
	}
}

// should check inputs, color them green/red
// if all correct show note
// labels should have reveal buttons
// color next orange if unchecked/incorrect?
function checkTarget() {}
