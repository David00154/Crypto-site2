import {writable} from 'svelte/store';

export const _btcCash  = writable([
{
	coin: 'Bitcoin Cash',
	price: '$100 - $900usd bitcoinCash',
	time: '12 Hours',
	type: 'Bronze investment plan',
	profit: 'Profit and 30%'
},
{
	coin: 'Bitcoin Cash',
	price: '$1000 - $9000',
	time: '24 Hours',
	type: 'Platinum investment plan ',
	profit: 'Profit rate at 50%'
},
{
	coin: 'Bitcoin Cash',
	price: '$10000 - $19000',
	time: '12 Hours',
	type: 'Diamond investment plan ',
	profit: 'Profit rate at 70%'
},
{
	coin: 'Bitcoin Cash',
	price: '$20000 - $50000usd bitcoinCash',
	time: '24 Hours',
	type: 'Gold investment plan',
	profit: 'Profit rate at 100000'
}
]);

export const _btc  = writable([
	{
		coin: 'Bitcoin ',
		price: '$100 - $900usd bitcoin',
		time: '12 Hours',
		type: 'Bronze investment plan',
		profit: 'Profit and 30%'
	},
	{
		coin: 'Bitcoin ',
		price: '$1000 - $9000',
		time: '24 Hours',
		type: 'Platinum investment plan ',
		profit: 'Profit rate at 50%'
	},
	{
		coin: 'Bitcoin ',
		price: '$10000 - $19000',
		time: '12 Hours',
		type: 'Diamond investment plan ',
		profit: 'Profit rate at 70%'
	},
	{
		coin: 'Bitcoin ',
		price: '$20000 - $50000usd bitcoin',
		time: '24 Hours',
		type: 'Gold investment plan',
		profit: 'Profit rate at 100000'
	}
]);

export const _eth  = writable([
	{
		coin: 'Ethereum',
		price: '$100 - $900usd eth',
		time: '12 Hours',
		type: 'Bronze investment plan',
		profit: 'Profit and 30%'
	},
	{
		coin: 'Ethereum',
		price: '$1000 - $9000',
		time: '24 Hours',
		type: 'Platinum investment plan ',
		profit: 'Profit rate at 50%'
	},
	{
		coin: 'Ethereum',
		price: '$10000 - $19000',
		time: '12 Hours',
		type: 'Diamond investment plan ',
		profit: 'Profit rate at 70%'
	},
	{
		coin: 'Ethereum',
		price: '$20000 - $50000usd eth',
		time: '24 Hours',
		type: 'Gold investment plan',
		profit: 'Profit rate at 100000'
	}
]);

export const notification_body = writable({title: "", body: "", date: ""});

export const investment_details = writable({});