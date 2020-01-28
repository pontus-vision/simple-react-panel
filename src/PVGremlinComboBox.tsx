import React, {CSSProperties} from 'react';
// Be sure to include styles at some point, probably during your bootstrapping
import PontusComponent from './PontusComponent';
import Axios from 'axios';
// import {StylesConfig} from 'react-select/src/styles';

// import ResizeAware from 'react-resize-aware';
export interface PVGremlinComboBoxProps {
  namespace?: string;
  subNamespace?: string;
  mountedSuccess?: boolean;
  customFilter?: string | undefined;
  settings?: any | undefined;
  url?: string | undefined;
  value?: any | undefined;
  multi?: boolean;
  options?: any;
  onError?: { (err: any): void };
  onChange?: { (val: any): void };
  name?: string;
  optionsRequest?: any;
  placeholder?: React.ReactNode;
}

export interface PVGremlinComboBoxState extends PVGremlinComboBoxProps {
}

class PVGremlinComboBox extends PontusComponent<PVGremlinComboBoxProps, PVGremlinComboBoxState> {
  constructor(props: Readonly<PVGremlinComboBoxProps>) {
    super(props);
    
    this.req = undefined;
    if (!this.props.url)
    {
      throw new Error('must set the URL to forward requests');
    }
    
    const lastValStr = PontusComponent.getItem(`${this.props.namespace}-value`);
    
    // let optionsStr = PontusComponent.getItem(`${this.props.namespace}-options`);
    
    let lastVal = null;
    if (lastValStr)
    {
      lastVal = JSON.parse(lastValStr);
    }
    else
    {
      lastVal = lastVal ? lastVal : this.props.value ? this.props.value : this.props.multi ? [] : {};
      
      // let options = (!this.props.options) ? this.props.multi ? lastVal : [lastVal] : this.props.options;
    }
    
    lastVal = lastVal ? lastVal : this.props.value ? this.props.value : this.props.multi ? [] : {};
    
    const options = !this.props.options ? (this.props.multi ? lastVal : [lastVal]) : this.props.options;
    
    this.state = {
      ...props,
      value: lastVal,
      // ,options: [{label : "one", value: "one"}, {label: "two", value: "two"}]
      options: options,
    };
  }
  
  getOptions = (jsonRequest: any) => {
    if (jsonRequest)
    {
      let reqToSave = jsonRequest;
      if (typeof jsonRequest === 'object')
      {
        reqToSave = JSON.stringify(jsonRequest);
      }
      PontusComponent.setItem(`${this.props.namespace}.optionsJsonRequest`, reqToSave);
    }
    
    const url = this.props.url ? this.props.url : PontusComponent.getRestVertexLabelsURL(this.props);
    
    if (this.req)
    {
      this.req.cancel();
    }
    
    const CancelToken = Axios.CancelToken;
    this.req = CancelToken.source();
    
    Axios.post(url, jsonRequest, {
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        cancelToken: this.req.token,
      })
      .then(response => {
        // this.reactSelect.options = response.data.labels || [];
        if (response.data && response.data.labels)
        {
          for (let i = 0; i < response.data.labels.length; i++)
          {
            const lbl = response.data.labels[i];
            lbl.label = PontusComponent.t(lbl.label);
          }
          this.setState({
            options: response.data.labels,
          });
        }
        
        // callback(null, {
        //   options: response.data.labels || [],
        //   complete: true
        //
        // });
      })
      .catch((thrown: any) => {
        if (Axios.isCancel(thrown))
        {
          console.log('Request canceled', thrown.message);
        }
        else
        {
          this.onError(thrown);
        }
      });
    
    // return retVal;
  };
  
  onError = (err: any): void => {
    if (this.props.onError)
    {
      this.props.onError(err);
    }
    else
    {
      console.error('error loading pages ' + err);
    }
  };
  
  onChange = (value: any) => {
    this.setState({
      value: value,
    });
    PontusComponent.setItem(`${this.props.namespace}-value`, JSON.stringify(value));
    
    if (this.props.onChange)
    {
      this.props.onChange(value);
      // this.reactSelect.setFocus();
    }
  };
  
  componentDidMount() {
    /* you can pass config as prop, or use a predefined one */
    let savedReq: any | undefined = PontusComponent.getItem(`${this.props.namespace}.optionsJsonRequest`);
    try
    {
      if (savedReq)
      {
        savedReq = JSON.parse(savedReq);
      }
      else
      {
        savedReq = this.props.optionsRequest;
      }
    } catch (e)
    {
    }
    
    this.getOptions(savedReq);
  }
  
  componentWillUnmount() {
    // this.props.glEventHub.off('pvgrid-on-data-loaded', this.onDataLoadedCb);
  }
  
  render() {
    // const customStyles: StylesConfig = {
    //   option: (provided: CSSProperties, state: any) => ({
    //     ...provided,
    //     color: 'black',
    //     padding: 2,
    //   }),
    //   singleValue: (provided: CSSProperties, state: any) => {
    //     const opacity = state.isDisabled ? 0.5 : 1;
    //     const transition = 'opacity 300ms';
    //     return {...provided, opacity, transition};
    //   },
    // };
    
    // multi={this.props.multi === null ? true : this.props.multi}
    
    return (
      <select multiple={true}
              name={this.props.name || 'form-field-name'}
        // key={this.state.value}
              defaultValue={this.state.value}
        // isMulti={this.props.multi === null ? true : this.props.multi}
        // isClearable
        // options={this.state.options}
        // joinValues={true}
        // delimiter={','}
              inputMode={"search"}
              onChange={this.onChange}
        // placeholder={this.state.placeholder}
        // styles={customStyles}
      />
    );
    
    /*       return (
     <ul className="userlist">
     {this.state.users.map(function (user) {
     return <User
     key={user.name}
     userData={user}
     glEventHub={eventHub}/>
     })}
     </ul>
     )
     */
  }
}

export default PVGremlinComboBox;
