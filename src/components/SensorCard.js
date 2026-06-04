export default function SensorCard({

title,
value,
unit

}){

return(

<div className="bg-white shadow rounded-2xl p-6">

<h3 className="text-gray-500">

{title}

</h3>

<h1 className="text-4xl font-bold mt-3">

{value}

</h1>

<p className="text-gray-400">

{unit}

</p>

</div>

)

}