import * as React from 'react';
import { ClipLoader } from 'react-spinners';
import { Bar } from 'react-chartjs-2';
import './App.css';
import { CoinInfo } from './types/CoinInfo';
import { CoinPrice } from './types/CoinPrice';

export type State = {
  selectedCoin: string;
  selectedTime: string;
  currentFilter: string;
  selectedCurrency: string;
};

export type Props = {
  symbol: string;
  isLoading: boolean | undefined;
  coinTypes: CoinInfo[];
  barChartFilters: { coinToCompare: CoinInfo[] };
  barChartData: CoinPrice[];
  onCoinChange: (coinType: string, chartType: string) => void;
};

class BarChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedCoin: '',
      selectedCurrency: 'EUR',
      currentFilter: 'low',
      selectedTime: '',
    };
  }

  private onCurrencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectedCurrency: e.target.value });
  }

  onSymChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({
      selectedCoin: e.target.value,
    });

    this.props.onCoinChange(e.target.value, 'barchart');
  }

  render() {
    const initialCoinType =
      this.props.coinTypes.length > 0 ? this.props.coinTypes[0].CoinName : '';
    const coinTypesExist = this.props.coinTypes.length > 0;

    let data = {
      labels: [this.props.symbol, this.state.selectedCoin || initialCoinType],
      datasets: [
        {
          label: 'Todays price',
          fillColor: 'white',
          data: [
            this.props.barChartData[this.state.selectedCurrency],
            this.props.barChartFilters.coinToCompare[
              this.state.selectedCurrency
            ],
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    let options = {
      maintainAspectRatio: false,
      responsive: true,
      legend: {
        labels: {
          fontColor: 'white',
          fillStyle: 'white',
          margin: 5 + 'px',
          fontFamily: `"Roboto Mono",Helvetica,Arial,sans-serif`,
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              callback: (value: number, index: number) => {
                return (
                  `${this.state.selectedCurrency === 'EUR' ? '€' : '$'}` +
                  new Intl.NumberFormat('en-IN', {
                    maximumSignificantDigits: 3,
                  }).format(value)
                );
              },
              fontColor: 'white',
              fontSize: 10,
              fontFamily: 'Roboto Mono',
              beginAtZero: true,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              fontColor: 'white',
              fontFamily: 'Roboto Mono',
              fontSize: 12,
              beginAtZero: true,
            },
            barPercentage: 0.5,
          },
        ],
      },
    };

    return (
      <div className="barchart panel">
        {this.props.isLoading && this.props.coinTypes ? (
          <div className="loader">
            <ClipLoader color={'white'} loading={this.props.isLoading} />
          </div>
        ) : (
          <div>
            <label className="pt-label .modifier">
              Currency
              <div className="pt-select">
                <select
                  defaultValue={'EUR'}
                  onChange={e => this.onCurrencyChange(e)}
                >
                  <option value="EUR">Eur</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </label>

            <label className="pt-label .modifier">
              Comparison Coin
              <div className="pt-select">
                <select
                  value={
                    this.state.selectedCoin
                      ? this.state.selectedCoin
                      : coinTypesExist ? this.props.coinTypes[0].FullName : ''
                  }
                  onChange={e => this.onSymChange(e)}
                  name="coin-type"
                >
                  {this.props.coinTypes
                    ? this.props.coinTypes.map((coin, index) => {
                        return (
                          <option value={coin.Symbol} key={index}>
                            {' '}
                            {coin.CoinName}{' '}
                          </option>
                        );
                      })
                    : null}
                </select>
              </div>
            </label>

            <div>
              <Bar data={data} width={50} height={350} options={options} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default BarChart;
