# aws-dynamodb-iot
<b>IoT button data visualization</b>

Simple scripts to query AWS DynamoDB database that contains time-series of data sent by Amazon IoT (Dash) button. The data is represented as a table and a scatter plot. Read detailed description of this project on my blog: <a href = 'http://www.fhilitski.com/intrnet-of-things/'>on my blog</a>. 
<ul>
<li><a href='http://www.fhilitski.com/2016/09/visualizing-aws-iot-button-data-part-ii/'>How to set-up of the link between the AWS IoT and DynamoDB</a></li>
<li><a href='http://www.fhilitski.com/2016/09/visualizing-aws-iot-button-data-part-ii/'>Basics of AWS SDK for JavaScript and the DynamoDB query process</a></li>
<li><a href = 'http://www.fhilitski.com/2016/11/temperature-sensor-with-raspberry-pi-3-and-aws/'>Connection Raspberry Pi with temperature sensors to AWS</a></li>

<p>
About files in this repository:</br>
index.html - simple front-end for query of DynamoDB and data processing</br>
table_processor.js - processing of the query data and representation as HTML table using dynatable.js</br>
plotly_scatter.js - visualization of the processed data with plot.ly JavaScript library</br>
</p>
The code should work out of the box, just copy all three file into the same directrory. 
</br>You have to obtain security credentials using AWS IAM, make sure they allow you to read DynamoDB, and have the databas(es) set-up as described in posts mentioned above.




