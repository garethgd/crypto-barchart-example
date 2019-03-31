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
  priceIncrease: boolean;
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
      priceIncrease: false,
      selectedCoin: undefined,
      selectedCoinPrice: '',
      coinTypes: [],
      loading: true,
    };
  }

  componentWillMount() {
    this.getCoinTypes();
    this.getCoinCompare();
  }

  componentWillUnmount() {
     if(this.eventSource)
     this.eventSource.close();
  }

  startEventSource(coinType: string) {
    this.eventSource = new EventSource(`http://localhost:5000/coins?coin=${coinType}`);
    this.eventSource.onmessage = e =>
    this.updateCoins(JSON.parse(e.data));
  }

  updateCoins(prices: any) {
   this.getPriceChange(prices.EUR)
   this.setState(Object.assign({}, { selectedCoinPrice: prices.EUR }));
  }

  private async getCoinCompare(coinType?: string) {
    if (coinType) this.setState({ loading: true });

    let coinToCompare = coinType ? coinType : 'BTC';
   
    const res = axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=${coinToCompare}&tsyms=${
        coinType ? coinType + ',' : ','
      }USD,EUR`
    );

    this.startEventSource(coinToCompare);

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

        const initialCoin = coins.find(coin => coin.Symbol === this.state.selectedCoinSymbol);

        if (initialCoin)
        this.getCoinCompare(initialCoin.Symbol);
        this.setState({
          coinTypes: coins,
          selectedCoin: initialCoin
        });
      })
      .catch(function(error) {});
  }

  onSymChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.getCoinCompare(e.target.value);
    if(this.eventSource) {
    this.eventSource = new EventSource(`http://localhost:5000/coins?coin=${e.target.value}`);
    this.eventSource.onmessage = e =>
    this.updateCoins(JSON.parse(e.data));
    }
  }

  getPriceChange(price: any) {
    const { selectedCoinPrice } = this.state;
    let priceIncreased: boolean = false;
    price > selectedCoinPrice ? priceIncreased = true : priceIncreased = false;
    this.setState({ priceIncrease: priceIncreased })
  }


  public render() {
    const { selectedCoinPrice, coinTypes, loading, selectedCoinSymbol, priceIncrease } = this.state;
   
    return (
      <div className="App">
       {loading && coinTypes ? (
          <div className="loader">
            <ClipLoader color={'white'} loading={loading} />
          </div>
        ) : (
        <div className="">
          <h2> {selectedCoinSymbol ? selectedCoinSymbol: null } Price</h2>
           <h3 style={{color: 'white'}}>EUR: 
           <span className={`${priceIncrease ? 'increase' : 'decrease'}`}>  {priceIncrease ? '↑' : '↓'} {selectedCoinPrice ? selectedCoinPrice : 'No Price' } </span>
           </h3>
    
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
