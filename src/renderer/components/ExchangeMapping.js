/*
Copyright (C) 2018-2020 AI Atelier Ltd.

This file is part of Invizi.

Invizi is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.

Invizi is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with Invizi.  If not, see <https://www.gnu.org/licenses/>.
*/
const EXCHANGE_MAPPING = {
  okex: {
    ignore: ['CIC', 'GSC', 'INSUR', 'OKB', 'TRA', 'TRIO', 'UCT', 'WBTC', 'WFEE', 'ZIP'],
    cmc: {
      'Hi Mutual Society': 'hi-mutual-society',
      CAN: 'content-and-ad-network',
      FairGame: 'fairgrame',
      IOTA: 'iota',
      Maggie: 'maggie',
      XRB: 'nano'
    }
  },
  bittrex: {
    ignore: ['NBT']
  },
  binance: {
    cmc: {
      BCC: 'bitcoin-cash',
      BQX: 'ethos',
      IOTA: 'iota',
      XRB: 'nano',
      YOYO: 'yoyow'
    },
    ignore: ['ETF', '123', '456']
  },
  kucoin: {
    cmc: {
      XRB: 'nano',
      MEE: 'coinmeet'
    },
    newCoins: {
      MWAT: {
        id: 'restart-energy',
        name: 'Restart Energy'
      },
      BHC: {
        id: 'black-hole-coin',
        name: 'Black Hole Coin'
      }
    },
    ignore: ['SAY', 'GALA', 'ABTC']
  },
  bitfinex: {
    cmc: {
      AIO: 'AION',
      DAT: 'DATA',
      DSH: 'DASH',
      IOS: 'IOST',
      IOTA: 'MIOTA',
      MIT: 'MITH',
      MNA: 'MANA',
      QSH: 'QASH',
      QTM: 'QTUM',
      REP: 'augur',
      SNG: 'SNGLS',
      SPK: 'SPANK',
      STJ: 'STORJ',
      YYW: 'YOYOW'
    },
    newCoins: {
      RRT: {
        id: 'recovery-right-token',
        name: 'Recovery Right Token'
      },
      BCI: {
        id: 'bitcoin invest',
        name: 'Bitcoin Invest'
      }
    },
    ignore: [
      'ORS Group', 'POLY', 'NCASH', 'CTXC', 'SEER', 'ATMI', 'Hydro Protocol', 'IQ', 'ABYSS', 'UTNP', 'USDT', 'GUSD', 'USDC',
      'TUSD', 'VSYS', 'ATOM', 'XCHF', 'ZB', 'AMPL', 'ALGO', 'DATA', 'QASH', 'YOYOW', 'QTUM', 'SPANK', 'MANA', 'SNGLS', 'IOST', 'AION', 'WAXP',
      'MITH', 'STORJ']
  },
  kraken: {
    cmc: {
      ICN: 'icon',
      REP: 'augur',
      XETC: 'ethereum-classic',
      XETH: 'ethereum',
      XICN: 'iconomi',
      XLTC: 'litecoin',
      XMLN: 'melon',
      XREP: 'augur',
      XXBT: 'bitcoin',
      XDG: 'dogecoin',
      XXLM: 'stellar',
      XXMR: 'monero',
      XXRP: 'ripple',
      XZEC: 'zcash',
      ZCAD: 'CAD',
      ZEUR: 'EUR',
      ZGBP: 'GBP',
      ZJPY: 'JPY',
      ZKRW: 'KRW',
      ZUSD: 'USD'
    },
    ignore: ['OXT', 'PAXG']
  },
  poloniex: {
    cmc: {
      Bitmark: 'BTM'
    }
  }
}

const kraken = EXCHANGE_MAPPING['kraken']
export { kraken }
export default EXCHANGE_MAPPING
