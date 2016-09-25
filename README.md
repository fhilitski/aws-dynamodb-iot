# aws-dynamodb-iot
<b>IoT button data visualization</b>

Simple scripts to query AWS DynamoDB database that contains time-series of data sent by Amazon IoT (Dash) button. The data is represented as a table and a scatter plot. Read detailed description of this project <a href = 'http://www.fhilitski.com/2016/09/visualizing-aws-iot-button-data/'>here</a> and <a href='http://www.fhilitski.com/2016/09/visualizing-aws-iot-button-data-part-ii/'>here</a>. <a href = 'http://www.fhilitski.com/2016/09/visualizing-aws-iot-button-data/'>The first link</a> describes set-up of the link between the AWS IoT and DynamoDB.  <a href='http://www.fhilitski.com/2016/09/visualizing-aws-iot-button-data-part-ii/'>The second link</a> explains the basics of AWS SDK for JavaScript and the DynamoDB query process. 
<p>
About files in this repository:</br>
index.html - simple front-end for query of DynamoDB and data processing</br>
table_processor.js - processing of the query data and representation as HTML table using dynatable.js</br>
plotly_scatter.js - visualization of the processed data with plot.ly JavaScript library</br>
</p>
The code should work out of the box, just copy all three file into the same directrory. 



