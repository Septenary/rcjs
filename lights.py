#!/usr/bin/python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)

# init list with pin numbers
pinList = [2, 3 ,4, 17, 27, 22, 10, 9]

# loop through pins and set mode and state to 'low'
for i in pinList:
    GPIO.setup(i, GPIO.OUT)
    GPIO.output(i, GPIO.HIGH)
    
# main loop
def relayToggle(a, b):
    if b == 1:
        GPIO.output(pinList[a], GPIO.LOW)
        print("@relay " + str(a-1) + " @pin " + str(pinList[a]) + " :: LOW")
    else:
        GPIO.output(pinList[a], GPIO.HIGH)
        print("@relay " + str(a-1) + " @pin " + str(pinList[a]) + " :: HIGH")
SleepTimeL = .2
try:
   count = 8
   while (count > 0):

      for i in pinList:
         GPIO.output(i, GPIO.LOW)
         time.sleep(SleepTimeL);

      pinList.reverse()

      for i in pinList:
         GPIO.output(i, GPIO.HIGH)
         time.sleep(SleepTimeL);

      pinList.reverse()
      count = count - 1

except KeyboardInterrupt:
    print(" Quit");
    GPIO.cleanup();
    
    
    
    
