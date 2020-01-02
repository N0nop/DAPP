import { Layout, Menu, Breadcrumb, Icon } from 'antd';
import React, { Component } from 'react';
import 'antd/dist/antd.css';
import logo from '../logo.svg';
import './Navi.css';
import { Button } from 'antd';
import { Input } from 'antd';
import { Collapse } from 'antd';
import Web3 from "web3";



let web3 = window.web3;
const { Header, Content, Footer, Sider } = Layout;
const { TextArea,Search } = Input;
const { Panel } = Collapse;
const { SubMenu } = Menu;
// For test
const onChange = e => {
    console.log(e);
};
const CONTRACT = "0xBa9e57F53414F3B61AB8da64b574CFeE6308818D";


class SiderDemo extends Component {

    state = {
        collapsed: false,
        mode: 'inline',
        loading: false,
        iconLoading: false,
        showstate: false,
        content: "",
        account:"",
    };

    // For the author 
    notes = {
        length:0,
        idx:0,
        items:[]
        // The notes' contents
        // Format:
        // {content : "content" , idx: "123", title: "title"}
    }
    
    // For searching others' notes
    other_notes = {
        length:0,
        idx:0,
        items:[]
        // The notes' contents
        // Format:
        // {content : "content" , idx: "123", title: "title"}
    }

    edit_idx = -1;

    // Get account from metamask or set by default
    componentWillMount() {
        window.addEventListener("load", async () => {
          if (window.ethereum) {
            // console.log("init metamask", window.ethereum);
            web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            await web3.eth.getAccounts(function(err, accounts) {
            web3.eth.defaultAccount = accounts[0];
            });
          } else {
            console.log("inject sdk");
            web3 = new Web3(
              new Web3.providers.HttpProvider("http://localhost:7545")
            );
            // 添加Ganache第一个账户的私钥
            web3.eth.accounts.wallet.add(
              "0x9d3908699ff0fff75d409fc5bac0ea322cc6287c47299959ee291aef6cfe67a4"
            );
            
            web3.eth.defaultAccount = "0x819De97b7B694941D4F82a9C9B4af544109407F9";
           }
            // Get the number of notes at the very beginning, use the "await" to make sure that read can be successful after get the right length
            await this.GetLength(web3.eth.defaultAccount,1);
            // Read all notes for displaying
            this.Read(web3.eth.defaultAccount,1);
        });
      }

    // Call the smart contract to get the number of notes in total
    GetLength = async (account,my) => {
        // Call the function Length in smart contract
        try{
            const payload = web3.eth.abi.encodeFunctionCall(
                {
                  name: "Length",
                  type: "function",
                  inputs: [{
                      type: 'address',
                      name: '_address'
                  }]
                },
                [account]
            );
    
            const res = await web3.eth.call({
                to: CONTRACT,
                data: payload
            });
            
            // Argument "my" is used to decide change the "length" of the account owner or others
            if(my == 1){
                this.notes["length"] = web3.eth.abi.decodeParameter("uint256", res);
            }
            else{
                this.other_notes["length"] = web3.eth.abi.decodeParameter("uint256", res);
            }
        }
        catch(e)
        {
            // If there is error, same as below
            console.error(e.message);
        }
            
    };

    // Call the smart contract to write the note
    WriteNote = async (content) => {
        // Call the function Write in smart contract
        const funcSig = web3.eth.abi.encodeFunctionSignature("Write(address,string)");
        const param = web3.eth.abi.encodeParameters(['address','string'],[web3.eth.defaultAccount,content]);
        try {
            await web3.eth.sendTransaction({
              to: CONTRACT, 
              data: funcSig + param.slice(2),
              gas: 2000000
            });
            alert("Write done.");
          } catch (e) {
            console.error(e.message);
          } finally {
            // Update the length in state after writing down (maybe fail, thus length won't change)
            this.GetLength(web3.eth.defaultAccount,this.notes); 
          }  
    };

    // Call the smart contract to modify the note
    ModifyNote = async (content) => {
        // Call the funcion Modify in smart contract
        const funcSig = web3.eth.abi.encodeFunctionSignature("Modify(address,uint256,string)");
        const param = web3.eth.abi.encodeParameters(['address','uint256','string'],[web3.eth.defaultAccount,this.edit_idx,content]);
        try {
            await web3.eth.sendTransaction({
              to: CONTRACT, 
              data: funcSig + param.slice(2),
              gas: 2000000
            });
            alert("Modify done.");
          } catch (e) {
            console.error(e.message);
          } finally {
            // Update the length
            this.GetLength(web3.eth.defaultAccount,this.notes); 
          }  
    }

    // Call the smart contract to read all the notes
    Read = async (account,my) => {
        this.setState({
            loading: true
        }); 
        var i=0;
        var length = 0;
        // The function of argument "my" is same as mentioned before
        // Note that has been read before won't be read twice (unless fresh or change the page)
        if(my == 1){
            i = this.notes["idx"]; 
            length = this.notes["length"];
        }
        else{
            i = this.other_notes["idx"]; 
            length = this.other_notes["length"];
        }
        try{
            for(;i<length;i++){
                // Call the function Read in smart contract
                const payload = web3.eth.abi.encodeFunctionCall(
                    {
                      name: "Read",
                      type: "function",
                      inputs: [{
                          type: 'address',
                          name: '_address',
                      },{
                          type: 'uint256',
                          name: 'index',
                      }]
                    },
                    [account,i]
                );
                const res = await web3.eth.call({
                    to: CONTRACT,
                    data: payload
                });
                this.setState({
                    content: web3.eth.abi.decodeParameter("string", res),
                    // idx:i+1
                });  
                // Same as above
                if(my == 1){
                    this.notes["idx"] = i+1; 
                    this.notes["items"].push({'content': this.state.content.substr(this.state.content.indexOf("\n\n")+2),'idx': i.toString(), 'title': this.state.content.substr(0,this.state.content.indexOf("\n\n"))})
                }
                else{
                    this.other_notes["idx"] = i+1; 
                    this.other_notes["items"].push({'content': this.state.content.substr(this.state.content.indexOf("\n\n")+2),'idx': i.toString(), 'title': this.state.content.substr(0,this.state.content.indexOf("\n\n"))})
                }
                // Update the page after read successfully
                this.changeShowState2true();
            }                  
        }
        catch(e)
        {
            console.error(e.message);
        }
        finally
        {
            this.setState({
                loading: false
            }); 
        }
           
    };

    // The page style control
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    enterLoading = () => {
        this.setState({ loading: true });
    };

    enterIconLoading = () => {
        this.setState({ iconLoading: true });
    };

    enterIconLoading = () => {
        this.setState({ nno: true });
    };

    setAccount = (account) => {
        this.setState({account: account});
        // web3.eth.defaultAccount = this.state.account;
    };

    changeShowState2true() {
        this.setState((state) => {
          return {showstate: true}
        });
      }
    // Those Func_MyNotes, Func_NewNote, Func_FindNote, Func_SearchOtherNote are all binded to click button for page switching
    Func_MyNotes = () => {
        if(this.state.loading == true) return;
        this.displayAndHiddenBtn("shownotes","d");
        this.displayAndHiddenBtn("upload_div","h");
        this.displayAndHiddenBtn("search_input","h");
        this.displayAndHiddenBtn("show_other_notes","h");
        this.displayAndHiddenBtn("edit_div", "h");
    };
    Func_NewNote = () => {
        if(this.state.loading == true) return;
        this.displayAndHiddenBtn("shownotes","h");
        this.displayAndHiddenBtn("upload_div","d");
        this.displayAndHiddenBtn("search_input","h");
        this.displayAndHiddenBtn("show_other_notes","h");
        this.displayAndHiddenBtn("edit_div", "h");
    };
    Func_FindNote = () => {
        if(this.state.loading == true) return;
        this.displayAndHiddenBtn("shownotes","h");
        this.displayAndHiddenBtn("upload_div","h");
        this.displayAndHiddenBtn("search_input","d");
        this.displayAndHiddenBtn("show_other_notes","h");
        this.displayAndHiddenBtn("edit_div", "h");
    };

    EmptyOtherNotes = () => {
        this.other_notes["length"] = 0;
        this.other_notes["idx"] = 0;
        this.other_notes["items"] = [];
    }

    Func_SearchOtherNote = async (account) => {
        try {
            this.EmptyOtherNotes();
            await this.GetLength(account,0);
            this.Read(account,0);
            this.displayAndHiddenBtn("shownotes","h");
            this.displayAndHiddenBtn("upload_div","h");
            this.displayAndHiddenBtn("search_input","d");
            this.displayAndHiddenBtn("show_other_notes","d");
            this.displayAndHiddenBtn("edit_div", "h");
            document.getElementById("other_navigation").innerText = "Results:";
          } catch (e) {
            console.error(e.message);
            alert("Not found");
          } finally {
            this.setState({
              loading: false
            });
          }
    }

    Func_EditNote = () => {
        if(this.state.loading == true) return;
        this.displayAndHiddenBtn("shownotes","h");
        this.displayAndHiddenBtn("upload_div","h");
        this.displayAndHiddenBtn("search_input","h");
        this.displayAndHiddenBtn("show_other_notes","h");
        this.displayAndHiddenBtn("edit_div", "d");
    }

    // Those Func_doUpload, Func_doSearch, Func_doEdit are all binded to click button for calling the function in smart contract
    Func_doUpload = async (title,content) => {
        var tmp;
        tmp = title+"\n\n"+content;
        await this.WriteNote(tmp);
        window.location.reload(true); 
    };

    Func_doSearch = (title) => {
        var i=0;
        var content, title;
        var find = 0;
        for(i=0;i<this.notes["length"];++i){
            if(this.notes["items"][i]["title"] === title){
                content = this.notes["items"][i]["content"];
                title = this.notes["items"][i]["title"];
                document.getElementById("edit_content").value = content;
                document.getElementById("edit_title").value = title;
                this.edit_idx = i;
                find = 1;
                break;
            }
        }

        if(find == 0)
        {
            alert("Not found");
        }
    };

    Func_doEdit = async (title, content) => {
        if(this.edit_idx == -1)
        {
            alert("Modify error, you must get the note you want to modify first!");
            return;
        }
        var tmp;
        tmp = title+"\n\n"+content;
        await this.ModifyNote(tmp);
        this.edit_idx = -1;
        window.location.reload(true); 
    }

    // For page switching
    displayAndHiddenBtn = (btnId, type)=> {
        var currentBtn = document.getElementById(btnId);
        if (type == "d") {
                currentBtn.style.display = "block"; //style中的display属性
            }
        else if (type == "h") {
                currentBtn.style.display = "none";
            }
        }
    
    render() {
        const { name } = this.state;
        return (
            <Layout>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={this.state.collapsed}
                >
            
                    <div className="logo" >
                        <span className="nav-text"  ></span>
                    </div>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                        <Menu.Item key="1" onClick={() => {this.Func_MyNotes()}}>
                            <Icon type="user" />
                            <span className="nav-text" >My Notes</span>
                        </Menu.Item>
                        <SubMenu
                            key="sub1"
                            title={
                            <span>
                                <Icon type="mail" />
                                <span>New / Edit</span>
                            </span>
                            }
                        >
                        <Menu.Item key="2" onClick={() => {this.Func_NewNote()}}>
                            <Icon type="upload" />
                            <span className="nav-text" >New note</span>
                        </Menu.Item>
                        <Menu.Item key="3" onClick={() => {this.Func_EditNote()}}>
                            <Icon type="upload" />
                            <span className="nav-text" >Edit note</span>
                        </Menu.Item>
                        </SubMenu>
                        <Menu.Item key="4" onClick={() => {this.Func_FindNote()}}>
                            <Icon type="right-circle" />
                            <span className="nav-text"  >Find notes</span>
                        </Menu.Item>
                        
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#000', padding: 0 }}>
                        <span style={{ color: '#fff', paddingLeft: '2%', fontSize: '1.4em' }}>
                            <Icon
                                className="trigger"
                                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle}
                                style={{ cursor: 'pointer' }}
                            />
                        </span>
                        <span style={{ color: '#fff', paddingLeft: '2%', fontSize: '1.4em' }}>Dapp Note</span>
                        <span style={{ color: '#fff', float: 'right', paddingRight: '1%' }}>
                            <img src={logo} className="App-logo" alt="logo" />
                        </span>
                    </Header>
                    
                    
                    <Content style={{ margin: '0 160px' }} >
                    <div style={{ padding: 24, background: '', minHeight: document.body.clientHeight }}>
                        <Breadcrumb style={{ margin: '20px 0' }}>
                            <div id="shownotes" style={{display:'block'}}>
                            <p id = "my_navigation">My Notes:</p>
                            <Collapse accordion >
                                    {this.notes["items"].map((note) => {
                                    return (
                                        <Panel header={note.title} key={note.idx}>
                                            <p>{note.content}</p>
                                        </Panel>
                                    )
                                    })}
                            </Collapse>
                            </div>
                        </Breadcrumb>           
                        <div id = "upload_div" style={{display:'none'}}>
                                <Input  id = "input_title" placeholder="input with title " allowClear onChange={onChange} required/>
                                <br />
                                <br />
                                <TextArea id = "input_content" rows="20" cols="20" placeholder="textarea with clear icon" allowClear onChange={onChange} />
                                <Button  type="primary"  onClick={() => {this.Func_doUpload(document.getElementById("input_title").value,document.getElementById("input_content").value)}} >
                                    Click to Upload!
                                </Button>
                        </div>
                        <div id = "edit_div" style={{display:'none'}}>
                            <div >
                                    <Search
                                        id = "search_accord_title"
                                        placeholder="input title"
                                        enterButton="Search"
                                        size="large"
                                        onSearch={value => this.Func_doSearch(value)}
                                    />
                            </div>
                            <br />
                            <br />
                            <Input  id = "edit_title" placeholder="Your original title will be put here " allowClear onChange={onChange}/>
                            <br />
                            <br />
                            <TextArea id = "edit_content" rows="20" cols="20" placeholder="Your original content will be put here" allowClear onChange={onChange} />
                            <Button  type="primary" loading={this.state.loading} onClick={() => {this.Func_doEdit(document.getElementById("edit_title").value,document.getElementById("edit_content").value)}}>
                                Click to Edit!
                            </Button>
                        </div>
                        <div id = "search_input" style={{display:'none'}}>
                                <Search
                                    id = "search_content"
                                    placeholder="input search address"
                                    enterButton="Search"
                                    size="large"
                                    onSearch={value => this.Func_SearchOtherNote(value)}
                                />
                        </div>
                        <Breadcrumb style={{ margin: '20px 0' }} id="show_other_notes" style={{display:'none'}}>
                            <div >
                                <br />
                                <p id = "other_navigation"></p>
                            <Collapse accordion >
                                    {this.other_notes["items"].map((other_note) => {
                                    return (
                                        <Panel header={other_note.title} key={other_note.idx}>
                                            <p>{other_note.content}</p>
                                        </Panel>
                                    )
                                    })}
                                </Collapse>
                            </div>
                        </Breadcrumb>    
                        </div>
                    </Content>
                   
                    <Footer style={{ textAlign: 'center' }}>
                        Designed By Martin & Nop
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}

export default SiderDemo;