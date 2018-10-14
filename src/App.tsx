import * as React from 'react';
import './App.css';
import { ClipLoader } from 'react-spinners'
import { CoinHistory } from './types/CoinHistory'
import BarChart from './barChart'
import { CoinPrice } from './types/CoinPrice'
import { CoinInfo } from './types/CoinInfo'
import axios from 'axios'
import { AxiosPromise } from 'axios'
import { Total } from './types/Total'
import { Moment } from 'moment'

export type State = {
  loading: { barChart?: boolean; lineChart?: boolean }
  coinTypes: CoinInfo[]
  coinNames: string[]
  barChartData: CoinPrice[]
  barChartFilters: { coinToCompare: CoinInfo[] }
}

export type Props = {
  data: Total | null
  error: { errorHappened: boolean; errorMsg: string }
  loading: boolean
  onSaveHistory: (history: Total) => void
  total: Total
}



class App extends React.Component<Props,State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      barChartData: [],
      barChartFilters: { coinToCompare: [] },
      coinNames: [],
      coinTypes: [],
      loading: { barChart: true, lineChart: true },
    }
  }

   private async getCoinCompare(coinType?: string) {
    if (coinType) this.setState({ loading: { barChart: true } })

    let coinToCompare = coinType ? coinType : this.props.total.symbol
    const res = axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=${coinToCompare}&tsyms=${
        coinType ? coinType + ',' : ','
      }USD,EUR`
    )

    const response = await res

    let coinPrice = response.data
    const barChartData = this.state.barChartData

    if (coinType)
      this.setState({
        barChartData: barChartData,
        barChartFilters: { coinToCompare: coinPrice },
        loading: { barChart: false },
      })
    else {
      this.setState({ barChartData: coinPrice })
    }
  }
  public render() {
    return (
      <div className="App">
        <div className="">
                    <h2> Compare coin by day </h2>
                    <BarChart
                      isLoading={this.state.loading.barChart}
                      barChartFilters={this.state.barChartFilters}
                      onCoinChange={(coinType: string, chartType: string) =>  this.getCoinCompare(coinType)  }
                      coinTypes={this.state.coinTypes}
                      barChartData={this.state.barChartData}
                      symbol={'EUR'}
                    />
                  </div>
      </div>
    );
  }
}

export default App;
