import React from 'react'
import {Card, Col, Row, Icon, Upload, message, Button, Modal,BackTop,Table,Divider} from 'antd'
import CustomBreadcrumb from '../../../components/CustomBreadcrumb'
import TypingCard from '../../../components/TypingCard'
import ExportJsonExcel from 'js-export-excel';
import './css/style.css'

const Dragger = Upload.Dragger;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}



const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
      render: (text, record) => {
          return (
              <span className={(text == null || text == "" || text.indexOf("wrong") != -1)? "error" : 'OK'}>{(text == null || text == "")? "无法识别": text}</span>);

    }
  }, {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
        render: (text, record) => {
            return (
                <span className={(text == null || text == "")? "error" : 'OK'}>{(text == null || text == "")? "无法识别": text}</span>);
        }
  }, {
    title: '出生日期',
    dataIndex: 'birth',
    key: 'birth',
        render: (text, record) => {
            return (
            <span className={(text == null || text == "")? "error" : 'OK'}>{(text == null || text == "")? "无法识别": text}</span>);
        }
  }, {
    title: '护照号码',
    dataIndex: 'passnum',
    key: 'passnum',
        render: (text, record) => {
            return (
                <span className={(text ==  null || text == "" || text.indexOf("wrong") != -1)? "error" : 'OK'}>{(text == null || text == "")? "无法识别": text}</span>);
        }
  }, {
    title: '导出到Excel',
    key: 'action',
    className:'actionStyle',
  }]



const host = 'http://localhost:8080'

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



class UploadDemo extends React.Component {
  state = {}

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
    fetch(host + '/Ocr/Name', {
      method:'post',
      body:formData
    })
        .then(res => res.json())
        .then(data => {
          console.log(data);

            this.setState({ocrData: data});
    })
  }

  export = () => {
      var option = {}
      var data = []
      var time = new Date()
      var timestamp = Date.parse(time)

      option.fileName = timestamp //导出的Excel文件名
      option.datas = [
          {
              sheetData: this.state.ocrData,
              sheetName: 'sheet',
              sheetFilter: ['name', 'sex', 'birth', 'passnum'],
              sheetHeader: ['name', 'sex', 'birth', 'passnum'],
          }
      ]

      var toExcel = new ExportJsonExcel(option);
      toExcel.saveExcel();

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
          <CustomBreadcrumb arr={['上传护照']}/>

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
                  开始识别
                </Button>
              </Card>

          </Row>

          <Table dataSource={this.state.ocrData} columns={columns} style={styles.tableStyle}
                 onHeaderRow={column => {
              return {
                  onClick: () => {this.export()}, // 点击表头行
              };
          }} />
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


export default UploadDemo