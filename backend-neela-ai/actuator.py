from pydantic import BaseModel

actuator_state = {
    "mode": "AUTONOMOUS",
    "aerator": False,
    "feeder": False,
    "pump": False,
    "stabilizer": False,
    "buzzer": False,
    "beep": False
}


class ActuatorInput(BaseModel):
    mode: str
    aerator: bool
    feeder: bool
    pump: bool
    stabilizer: bool
    buzzer: bool


def get_actuator_state():
    return actuator_state


def update_actuator_state(data):

    global actuator_state

    actuator_state = {
        "mode": data.mode,
        "aerator": data.aerator,
        "feeder": data.feeder,
        "pump": data.pump,
        "stabilizer": data.stabilizer,
        "buzzer": data.buzzer,
        "beep": actuator_state["beep"]
    }

    return actuator_state