import { Card, CardHeader, CardBody, Box, Text, Stack, Heading, StackDivider } from '@chakra-ui/react'


const Branches = () => {
    return(
<>
<Card bg="#242424" color="#8affd4" boxShadow='dark-lg' p='6' rounded='md'>
  <CardHeader>
    <Heading size='md'>Branches</Heading>
  </CardHeader>

  <CardBody>
    <Stack divider={<StackDivider />} spacing='4'>
      <Box>
        <Heading size='xs' textTransform='uppercase'>
          Summary
        </Heading>
        <Text pt='2' fontSize='sm'>
          View a summary of all your clients over the last month.
        </Text>
      </Box>
      <Box>
        <Heading size='xs' textTransform='uppercase'>
          Overview
        </Heading>
        <Text pt='2' fontSize='sm'>
          Check out the overview of your clients.
        </Text>
      </Box>
      <Box>
        <Heading size='xs' textTransform='uppercase'>
          Analysis
        </Heading>
        <Text pt='2' fontSize='sm'>
          See a detailed analysis of all your business clients.
        </Text>
      </Box>
    </Stack>
  </CardBody>
</Card>
</>
    )
}

export default Branches;