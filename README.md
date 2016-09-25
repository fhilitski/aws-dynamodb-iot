# aws-dynamodb-iot
IoT button data visualization

Simple scripts to query AWS DynamoDB database that contains time-series of data sent by Amazon IoT (Dash) button. The data is represented as a table and a scatter plot. Read detailed description of this project at http://www.fhilitski.com/2016/09/visualizing-aws-…ton-data-part-i and http://www.fhilitski.com/2016/09/visualizing-aws-…ton-data-part-ii. The first link describes set-up of the link between the AWS IoT and DynamoDB. The second link explains the basics of AWS SDK for JavaScript and the  DynamoDB query process. 

About files in this repository:

index.html - simple front-end for query of DynamoDB and data processing</br>
table_processor.js - processing of the query data and representation as HTML table using dynatable.js</br>
plotly_scatter.js - visualization of the processed data with plot.ly JavaScript library</br>

The code should work out of the box, just copy all three file into the same directrory. 



