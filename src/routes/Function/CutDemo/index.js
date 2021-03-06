import React from 'react'
import {Card, Col, Row, Icon, Upload, message, Button, Modal,BackTop,Table,Divider,Spin, Radio, List, Switch, Avatar,Anchor,Affix} from 'antd'
import CustomBreadcrumb from '../../../components/CustomBreadcrumb'
import TypingCard from '../../../components/TypingCard'

const Dragger = Upload.Dragger;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

const props = {
  name: 'file',
  action: 'http://localhost:8080/File',

  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      // console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  },

}



class CutDemo extends React.Component {
  state = {
    loading: false,
    previewVisible: false,
    fileList: [],
    previewImage: '',
    cutData: [],
  }

  beforeUpload(file, fileList) {
    this.setState(state => ({
        fileList: [...state.fileList, file],
    }));

    const isLt2M = file.size / 1024 / 1024 < 50;
    if (!isLt2M) {
      message.error('图片大小不超过 50MB!');
    }
    return isLt2M;
  }

  handlePicture = () => {
    console.log(this.state.fileList)
    let formData = new FormData();
    for(let i = 0; i < this.state.fileList.length; i++) {
        formData.append('file', this.state.fileList[i].name);
    }
    fetch('http://localhost:8080/Cut/Photo', {
      method:'post',
      body:formData
    })
        .then(res => res.json())
        .then(data => {
          console.log(data);


            this.setState({cutData: data});
    })

      // axios({
      //     method:"POST",
      //     url:"http://localhost:8080/Ocr/name",
      //     data:formData,
      //     //withCredentials:true
      // }).then(function(res){
      //     this.setState({ocrData: res})
      // }).catch(function(error){
      //     alert('post失败')
      //     console.log(error);
      // });

  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({loading: true});
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => this.setState({
        imageUrl,
        loading: false,
      }))
    } else if (info.file.status === 'error') {
      // console.log(info.file)
      message.error(`${info.file.name} 文件上传失败（${info.file.error.message}）`);
      this.setState({
        loading: false
      })
    }
  }
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  render() {
    const uploadButton = (
        <div>
          <Icon type="plus"/>
          <div className="ant-upload-text">Upload</div>
        </div>
    );

    return (
        <div>
          <CustomBreadcrumb arr={['护照照片截取']}/>

          <Row>
              <Card bordered={false} style={{...styles.colItem, minHeight: 255}} title='上传文件'>
                <Upload
                    action="http://localhost:8080/File/"
                    listType="picture-card"
                    fileList={this.state.fileList}
                    onPreview={this.handlePreview}
                    multiple={true}
                    onChange={({fileList}) => this.setState({fileList})}
                >
                  {uploadButton}
                </Upload>
                <Modal visible={this.state.previewVisible} onCancel={() => this.setState({previewVisible: false})}>
                  <img alt="example" style={{width: '100%'}} src={this.state.previewImage}/>
                </Modal>
                <Button type="danger" onClick={this.handlePicture}>
                  开始截取
                </Button>
              </Card>

          </Row>

          <Row>
          </Row>
          <Card bordered={false} title='截取结果' style={{marginBottom: 15}} id='verticalStyle'>
            <List dataSource={this.state.cutData}
                  itemLayout='vertical'
                  renderItem={item=>{
                      return (
                          <List.Item style={{display:'inline-block'}}>
                            <List.Item.Meta
                                avatar={<Avatar style = {{width:200,height:200}} src= {'data:img/png;base64,' + item.base64 } />}/>
                              {item.passnum}
                          </List.Item>
                      )
                  }}
            />
          </Card>
          <BackTop visibilityHeight={200} style={{right: 50}}/>
        </div>
    )
  }
}

const styles = {
  colItem: {
    minHeight: 230,
    borderRadius: 3,
    margin: '10px 0'
  }
}

export default CutDemo