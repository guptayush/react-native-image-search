
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableHighlight,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Toolbar} from 'react-native-material-ui';
var base64 = require('base-64');
const SCREEN_WIDTH = Dimensions.get('window').width;
const viewSize = (SCREEN_WIDTH-100)/3;

export default class App extends Component {

  constructor(props){
    super(props);
    this.state={
      dataSource:[],
      page:0,
      isLoadingMore:false,
      query:''
    }
    this.renderRow = this.renderRow.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
    this.setSearchText = this.setSearchText.bind(this);
    
  }

  componentWillMount(){
    this.fetchData(res=>{
      this.setState({page:res.page,dataSource:res.data})
    })
  }

  fetchData(callback){
    fetch(`https://api.shutterstock.com/v2/images/search?page=${this.state.page+1}&query=${this.state.query}&per_page=18`, { 
      headers: new Headers({
        'Authorization': 'Basic '+base64.encode('f6517-bb749-60845-c3278-63a21-4e56b:a59ea-02f1f-e2449-cce1d-dd98f-fbb93'), 
        'Content-Type': 'application/x-www-form-urlencoded'
     }) 
    })
    .then((res)=> res.json())
    .then(callback)
    .catch(error => {
        console.error(error)
    })
  }

  fetchMore(){
    if(this.state.dataSource.length>0){
      this.fetchData(res=>{
        console.log(res)
        this.setState({
          page:res.page,
          dataSource:this.state.dataSource.concat(res.data)
        },()=>this.setState({isLoadingMore:false}))
      })
    }
  }

  setSearchText(query){
    this.setState({query,page:0},()=>this.fetchData(res=>{
      console.log(res)
      this.setState({page:res.page,dataSource:res.data})
    }))
  }

  renderRow(data){
    return(
      <View style={styles.singleGrid} >
          <Image source={{uri:data.item.assets.huge_thumb.url}} style={{height:viewSize,width:viewSize}}/>
          <View style={{width:viewSize,marginTop:5}}>
          <Text ellipsizeMode='tail' numberOfLines={1}> {data.item.description} </Text>
          </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Toolbar
            centerElement={'GridView'}
            searchable={{
              autoFocus: true,
              placeholder: 'Type to Search Images',
              onChangeText: this.setSearchText
            }}
            style={{
              titleText:{paddingHorizontal:7,fontSize:20,fontWeight:'normal'}
            }}
        />
        <FlatList
          data={this.state.dataSource}
          numColumns={3}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => index}
          onEndReached={() =>{
            if(!this.state.isLoadingMore)
              this.setState({ isLoadingMore: true }, () => this.fetchMore())}
          }
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => {
            return (
              this.state.isLoadingMore &&
              <View style={{ flex: 1, padding: 12 }}>
                    <ActivityIndicator size="small" />
              </View>
            );
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  singleGrid:{
    padding:15
  }
});
