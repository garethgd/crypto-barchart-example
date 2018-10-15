import * as React from 'react';
import BarChart from './barChart';
import { CoinPrice } from './types/CoinPrice';
import { CoinInfo } from './types/CoinInfo';
import './App.css';
import axios from 'axios';

export type State = {
  loading: { barChart?: boolean; lineChart?: boolean };
  coinTypes: CoinInfo[];
  barChartData: CoinPrice[];
  barChartFilters: { coinToCompare: CoinInfo[] };
};

export type Props = {};

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      barChartData: [],
      barChartFilters: { coinToCompare: [] },
      coinTypes: [],
      loading: { barChart: true, lineChart: true },
    };
  }

  componentWillMount() {
    this.getCoinTypes();
    this.getCoinCompare();
  }

  private async getCoinCompare(coinType?: string) {
    if (coinType) this.setState({ loading: { barChart: true } });

    let coinToCompare = coinType ? coinType : 'ETH';
    const res = axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=${coinToCompare}&tsyms=${
        coinType ? coinType + ',' : ','
      }USD,EUR`
    );

    const response = await res;

    let coinPrice = response.data;
    const barChartData = this.state.barChartData;

    if (coinType)
      this.setState({
        barChartData: barChartData,
        barChartFilters: { coinToCompare: coinPrice },
        loading: { barChart: false },
      });
    else {
      this.setState({ barChartData: coinPrice });
    }
  }

  private getCoinTypes() {
    let coins: CoinInfo[] = [];
    axios
      .get(
        'https://rocky-bayou-96357.herokuapp.com/https://www.cryptocompare.com/api/data/coinlist/'
      )
      .then(response => {
        Object.keys(response.data.Data).forEach(function(key) {
          coins.push(response.data.Data[key]);
        });

        coins.sort((a, b) =>
          a.CoinName.toUpperCase().localeCompare(b.CoinName.toUpperCase())
        );

        this.getCoinCompare(coins[0].Symbol);
        this.setState({
          coinTypes: coins,
        });
      })
      .catch(function(error) {});
  }


  public render() {
    return (
      <div className="App">
        <div className="">
          <h2> Compare coin by day </h2>
          <BarChart
            isLoading={this.state.loading.barChart}
            barChartFilters={this.state.barChartFilters}
            onCoinChange={(coinType: string, chartType: string) =>
              this.getCoinCompare(coinType)
            }
            coinTypes={this.state.coinTypes}
            barChartData={this.state.barChartData}
            symbol={'ETH'}
          />
        </div>
      </div>
    );
  }
}

export default App;
