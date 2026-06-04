export function generateDummy() {

  return {

    temperature: Number(
      (26 + Math.random() * 8).toFixed(1)
    ),

    do: Number(
      (4 + Math.random() * 4).toFixed(2)
    ),

    ph: Number(
      (6.5 + Math.random() * 2).toFixed(2)
    ),

    turbidity: Number(
      (5 + Math.random() * 20).toFixed(1)
    ),

    hour: new Date().getHours()

  };

}