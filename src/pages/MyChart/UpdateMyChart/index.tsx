import {
  genChartByAiAsyncMqUsingPOST, genChartByAiAsyncUsingPOST,
  genChartByAiUsingPOST,
  getChartByIdUsingGET
} from '@/services/yubi/chartController';
import { UploadOutlined } from '@ant-design/icons';
import {Button, Card, Col, Divider, Form, Input, message, Row, Select, Space, Spin, Upload} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useState,useEffect } from 'react';
import { useForm } from 'antd/es/form/Form';
import { Link, useParams } from '@@/exports';
import ReactECharts from 'echarts-for-react';

/**
 * 添加图表页面
 * @constructor
 */
const UpdateChartAsync: React.FC = () => {
  const [chartU,setUChart] = useState<API.Chart>();
  const [form] = useForm();
  const [dataId,setDataId] = useState<API.getChartByIdUsingGETParams>()
  const [chart, setChart] = useState<API.BiResponse>();
  const [option, setOption] = useState<any>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  /**
   * 提交
   * @param values
   */
  const onFinish = async (values: any) => {


    // 避免重复提交
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setChart(undefined);
    setOption(undefined);
    // 对接后端，上传数据
    const params = {
      ...values,
      file: undefined,
    };
    try {
      const res = await genChartByAiAsyncUsingPOST(params, {}, values.file.file.originFileObj);
      if (!res?.data) {
        message.error('分析失败');
      } else {
        message.success('分析成功，请稍后在我的图表中查看');
        form.resetFields();
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
    setSubmitting(false);
  };

  const {id} = useParams();

  async function fetchData(){
    try {
      const res = await getChartByIdUsingGET({
        id:id,
      });
      setDataId(id)
      setUChart(res.data)
      setChart(res.data)
      form.setFieldsValue({
        goal: res?.data?.goal,
        name: res?.data?.name,
        chartType: res?.data?.chartType,
        chartData: res?.data?.chartData,

      });
      const chartOption = JSON.parse(res?.data?.genChart ?? '{}');
      chartOption.title = undefined;
      // 设置图表组件的数据
      setOption(chartOption);
    }catch (e: any) {
      message.error('获取图表错误');
    }
  }

  useEffect(() => {
    fetchData();
  }, [id, form]);

  return (
    <div className="update-chart">
      <Row gutter={24}>
        <Col span={12}>
          <Card title="智能分析">
            <Form name="addChart" labelAlign="left" labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }} onFinish={onFinish} initialValues={{}}form={form}>
              <Form.Item
                name="goal"
                label="分析目标"
                rules={[{ required: true, message: '请输入分析目标' }]}
              >
                <TextArea placeholder="请输入你的分析需求，比如：分析网站用户的增长情况" />
              </Form.Item>
              <Form.Item name="name" label="图表名称">
                <Input placeholder="请输入图表名称" />
              </Form.Item>
              <Form.Item name="chartType" label="图表类型" hasFeedback rules={[{ required: true, message: '请输入你的图表类型' }]}>
                <Select
                  options={[
                    { value: '折线图', label: '折线图' },
                    { value: '柱状图', label: '柱状图' },
                    { value: '堆叠图', label: '堆叠图' },
                    { value: '饼图', label: '饼图' },
                    { value: '雷达图', label: '雷达图' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="chartData" label={'原数据'} >

                <TextArea rows={10}size={"middle"}cols={5}readOnly autoFocus/>

              </Form.Item>

              <Form.Item name="file" label="上传新数据">
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined />}>上传 CSV 文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
                <Space style={{marginLeft:-105}}>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                    重新提交
                  </Button>
                  <Button htmlType="reset">重置</Button>
                  <Button type="primary"><Link to={'/my_chart'}>返回</Link></Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="分析结论">
            {chart?.genResult ?? <div>请先在左侧进行提交</div>}
            <Spin spinning={submitting}/>
          </Card>
          <Divider />
          <Card title="可视化图表">
            {
              option ? <ReactECharts option={option} /> : <div>请先在左侧进行提交</div>
            }
            <Spin spinning={submitting}/>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default UpdateChartAsync;
