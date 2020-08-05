
const FAKE_HISTORICAL_DATA =
      {
        'performance': {
          'BTC': {
            '24_hours': -0.0011670419155194903
          },
          'USD': {
            '24_hours': 0.008442847512633477
          }
        },
        'balanceHistorical': {
          'BTC': [0, 1.65, 1.65, 1.6523596581567204, 1.650431285176138],
          'USD': [0, 10687.24, 14489.965, 17290.63, 18445.055],
          'raw': {
            'coinsInvolved': ['bitcoin'],
            'data': [
              [1596156698, 1596243098, 1596329498, 1596415898, 1596502298],
              [{}, {
                'bitcoin': 10687.24
              }, {
                'bitcoin': 14489.965
              }, {
                'bitcoin': 17050.63,
                'usd': 2240
              }, {
                'bitcoin': 18205.055,
                'usd': 2240
              }]
            ]
          }
        },
        'historicalXAxisDates': ['2020-07-31 06:21:38', '2020-08-01 06:21:38', '2020-08-02 06:21:38', '2020-08-03 06:21:38', '2020-08-04 06:21:38']
      }

export default FAKE_HISTORICAL_DATA
