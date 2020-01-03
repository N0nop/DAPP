

# 前端
使用了React框架，antd提供的组件，以及使用Web3调用智能合约。
前端页面提供的功能有
1. 显示使用者账户的笔记信息。   
2. 上传新的笔记
3. 根据笔记的标题修改笔记的标题以及内容
4. 根据被查询者的地址查询其笔记内容


## 1. 获取当前使用者的账号
``` javascript
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
```

首先检测浏览器是否安装了metamask钱包插件，如果安装了，根据metamask的钱包账号，先获得用户授权，再获取当前账户的所有笔记信息，并且显示在首页。如果检测到浏览器没有安装metamask，则会根据代码中提供的账户地址以及私钥来得到其所有的笔记信息，并且显示在首页。
## 2. 显示当前用户的所有笔记信息

首先通过Getlength()函数调用合约的length函数，来获得用户的笔记的数量。然后再调用Read()函数，根据长度，来遍历存储在链上的笔记信息。前端得到笔记的内容之后，会先把笔记的内容存储在notes/other_notes的变量中，如果是使用者本人的笔记存在notes中，如果是查询到的别人的笔记，则存储在ohter_notes中。其结构如下，其中length字段存的是笔记的数量，idx存储的是笔记的下标，用来动态生成组件,iterms中存的是笔记，会根据Read得到的内容进行分割，然后以字典的形式存储。
```javascript
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
```
Getlength函数:
```javascript
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
```
链上存储笔记的格式如下：
``` c
title+"\n\n"+content
```
也就是笔记的标题和内容之间存在两个换行符,根据这两个换行符，分离出笔记的内容和标题，然后显示在对应的位置。
Read函数。
其中参数"my"是用来判断是否为调用者本人的账户。
```javascript
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
```
动态生成笔记的组件，使用map动态得到多个组件
```javascript
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
```
## 3. 上传新的笔记

这个界面会有两个输入框，分别对应笔记的title以及content，当点击提交按钮的时候，会得到输入的title以及输入的content。然后将其合成如下格式
```c
title+"\n\n"+content
```
之后就是调用通过WriteNote()来调用合约上的Write()函数，写入笔记。
代码如下：
```javascript
//获取输入内容
<div id = "upload_div" style={{display:'none'}}>
        <Input  id = "input_title" placeholder="input with title " allowClear onChange={onChange} required/>
        <br />
        <br />
        <TextArea id = "input_content" rows="20" cols="20" placeholder="textarea with clear icon" allowClear onChange={onChange} />
        <Button  type="primary"  onClick={() => {this.Func_doUpload(document.getElementById("input_title").value,document.getElementById("input_content").value)}} >
            Click to Upload!
        </Button>
</div>
//合成笔记内容和标题，调用Writenote()
Func_doUpload = async (title,content) => {
     var tmp;
     tmp = title+"\n\n"+content;
     await this.WriteNote(tmp);
     window.location.reload(true); 
 };
//调用合约上的Write函数，写入笔记
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
```

## 4. 修改笔记
这里会要求先输入文章标题，点击Search按钮，会得到文章内容。如果没有找到，就会弹出提示"Not Found"。如果找到，那么就把内容填入内容修改框，标题填入标题修改框，方便修改。当没有找到笔记对应下标的时候，是无法完成修改的。完成之后会刷新页面，回到展示所有笔记的页面。代码如下：
```javascript
//前端代码
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
//搜索并自动填入标题和内容
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
//如果找到，那么通过ModifyNote()调用合约中的Modify函数，完成之后将下标初始化，
//并且刷新页面，回到最开始的展示所有笔记的页面
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
//传入地址，下标以及标题和内容合成的content
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
```
## 5.查询别人的笔记
根据输入的被查询的地址，调用Getlength()以及Read()函数，笔记的相关信息均存储在other_note结构体变量中，过程与查询自己的笔记内容一致。如果没有查到，那么就会输出Not Found的提示框。如果查到了，那么就会在当前搜索框下面显示别人的笔记信息。
代码如下：
```javascript
//搜索框的实现
<div id = "search_input" style={{display:'none'}}>
        <Search
            id = "search_content"
            placeholder="input search address"
            enterButton="Search"
            size="large"
            onSearch={value => this.Func_SearchOtherNote(value)}
        />
</div>
//查询其他笔记的函数
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
//前端显示笔记的实现
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
```




