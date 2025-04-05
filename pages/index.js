import React, { useRef, useState, useEffect } from "react"
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { drawHand } from "../components/handposeutil"
import * as fp from "fingerpose"
import Handsigns from "../components/handsigns"

import {
  Text,
  Heading,
  Button,
  Box,
  VStack,
  ChakraProvider,
  Container,
  Stack,
  Textarea, // Added Textarea for user input
} from "@chakra-ui/react"

import Metatags from "../components/metatags"
import About from "../components/about"
import { RiCameraFill, RiCameraOffFill } from "react-icons/ri"

export default function Home() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const textAreaRef = useRef(null)

  const [camState, setCamState] = useState("on")
  const [detectedLetters, setDetectedLetters] = useState("")
  const [textInput, setTextInput] = useState("")

  async function runHandpose() {
    const net = await handpose.load()

    setInterval(() => {
      detect(net)
    }, 150)
  }

  async function detect(net) {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      const hand = await net.estimateHands(video)

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          Handsigns.aSign,
          Handsigns.bSign,
          Handsigns.cSign,
          Handsigns.dSign,
          Handsigns.eSign,
          Handsigns.fSign,
          Handsigns.gSign,
          Handsigns.hSign,
          Handsigns.iSign,
          Handsigns.jSign,
          Handsigns.kSign,
          Handsigns.lSign,
          Handsigns.mSign,
          Handsigns.nSign,
          Handsigns.oSign,
          Handsigns.pSign,
          Handsigns.qSign,
          Handsigns.rSign,
          Handsigns.sSign,
          Handsigns.tSign,
          Handsigns.uSign,
          Handsigns.vSign,
          Handsigns.wSign,
          Handsigns.xSign,
          Handsigns.ySign,
          Handsigns.zSign,
        ])

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5)

        if (
          estimatedGestures.gestures !== undefined &&
          estimatedGestures.gestures.length > 0
        ) {
          const confidence = estimatedGestures.gestures.map(p => p.confidence)
          const maxConfidence = confidence.indexOf(
            Math.max.apply(undefined, confidence)
          )

          const detectedSign = estimatedGestures.gestures[maxConfidence].name
          
          // Update detected letters and input text
          setDetectedLetters(prevLetters => prevLetters + detectedSign + " ")
          setTextInput(prevText => prevText + detectedSign + " ")

          // Auto-scroll to bottom
          setTimeout(() => {
            if (textAreaRef.current) {
              textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight
            }
          }, 50)
        }
      }

      const ctx = canvasRef.current.getContext("2d")
      drawHand(hand, ctx)
    }
  }

  useEffect(() => {
    runHandpose()
  }, [])

  function turnOffCamera() {
    setCamState(prevState => (prevState === "on" ? "off" : "on"))
  }

  return (
    <ChakraProvider>
      <Metatags />
      <Box bgColor="#5784BA" height="100vh" display="flex" flexDirection="column">
        <Container centerContent maxW="xl" flex="1">
          <VStack spacing={4} align="center">
            <Heading as="h1" size="lg" id="app-title" color="white" textAlign="center" top="100px">
              Signa
            </Heading>
          </VStack>

          <Box id="webcam-container" flex="1">
            {camState === "on" ? (
              <Webcam id="webcam" ref={webcamRef} />
            ) : (
              <div id="webcam" background="black"></div>
            )}
          </Box>

          <canvas id="gesture-canvas" ref={canvasRef} />
        </Container>

        {/* Textarea for detected text - Fixed at Bottom */}
        <Box
            position="fixed"
            bottom="100px"
            width="60%"
            bg="white"
            p={3}
            borderTop="2px solid gray"
            left="50%"
            transform="translateX(-50%)"
          >
            <Heading size="md" textAlign="center">Detected Letters</Heading>
            <Textarea
              ref={textAreaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Detected text will appear here..."
              size="md"
              bg="white"
              color="black"
              height="100px"
              overflowY="auto"
            />
          </Box>


        <Stack id="start-button" spacing={4} direction="row" align="center" p={3}>
          <Button
            leftIcon={
              camState === "on" ? <RiCameraFill size={20} /> : <RiCameraOffFill size={20} />
            }
            onClick={turnOffCamera}
            colorScheme="orange"
          >
            Camera
          </Button>
          <About />
        </Stack>
      </Box>
    </ChakraProvider>
  )
}
