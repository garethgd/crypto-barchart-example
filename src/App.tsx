import * as React from 'react';
import { CoinInfo } from './types/CoinInfo';
import './App.css';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export type State = {
  loading: boolean;
  coinTypes: CoinInfo[];
  data: any;
  selectedCoin: CoinInfo | undefined;
  selectedCoinPrice: string;
  selectedCoinSymbol: string
};

export type Props = {};

class App extends React.Component<Props, State> {
  private eventSource: EventSource | undefined;
 
  constructor(props: Props) {
    super(props);
    this.eventSource;
    this.state = {
      data: [],
      selectedCoinSymbol: 'BTC',
      selectedCoin: undefined,
      selectedCoinPrice: '',
      coinTypes: [],
      loading: true,
    };
  }

  componentDidMount() {
    if(this.eventSource)
    this.eventSource.onmessage = e =>
      this.updateCoins(JSON.parse(e.data));
  }

  updateCoins(coins: any) {
   let coinsArray: CoinInfo[] = [];

    Object.keys(coins.Data).forEach(function(key) {
      coinsArray.push(coins.Data[key]);
    });
    
    this.setState(Object.assign({}, { data: coinsArray }));
  }

  componentWillMount() {
    this.getCoinTypes();
    this.getCoinCompare();
  }

  private async getCoinCompare(coinType?: string) {
    if (coinType) this.setState({ loading: true });

    let coinToCompare = coinType ? coinType : 'ETH';
    const res = axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=${coinToCompare}&tsyms=${
        coinType ? coinType + ',' : ','
      }USD,EUR`
    );

    const response = await res;

    let coinPrice = response.data;

    if (coinType)
      this.setState({
        selectedCoinPrice: coinPrice.EUR,
        selectedCoinSymbol: coinType,
        loading: false 
      });
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

        const bitcoin = coins.find(coin => coin.Symbol === this.state.selectedCoinSymbol);

        this.eventSource = new EventSource(`http://localhost:5000/coins?coin=${this.state.selectedCoinSymbol}`);
        

        if(bitcoin)
        this.getCoinCompare(bitcoin.Symbol);
        this.setState({
          coinTypes: coins,
          selectedCoin: bitcoin
        });
      })
      .catch(function(error) {});
  }

  onSymChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.getCoinCompare(e.target.value);
  }


  public render() {
    const { selectedCoinPrice, coinTypes, loading, selectedCoinSymbol } = this.state;
   
    return (
      <div className="App">
       {loading && coinTypes ? (
          <div className="loader">
            <ClipLoader color={'white'} loading={loading} />
          </div>
        ) : (
        <div className="">
          <h2> {selectedCoinSymbol ? selectedCoinSymbol: null } Price</h2>
           <h3 style={{color: 'white'}}>EUR: {selectedCoinPrice ? selectedCoinPrice : 'No Price' }</h3>

           <select
                  value={
                    selectedCoinSymbol
                  }
                  onChange={e => this.onSymChange(e)}
                  name="coin-type"
                >
                  {coinTypes
                    ? coinTypes.map((coin, index) => {
                        return (
                          <option value={coin.Symbol} key={index}>
                            {coin.CoinName}
                          </option>
                        );
                      })
                    : null}
                </select>
        </div>)}
      </div>
    );
  }
}

export default App;
